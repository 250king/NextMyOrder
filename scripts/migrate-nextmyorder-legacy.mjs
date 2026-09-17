#!/usr/bin/env node
/**
 * NextMyOrder legacy -> split List/Order + aggregate Payment migration.
 *
 * Default: dry-run / validate only.
 * Apply:   node migrate-nextmyorder.mjs --write
 *
 * Requires:
 *   DATABASE_URL=postgresql://...
 *   npm package "pg" (already used by NextMyOrder)
 *
 * IMPORTANT:
 * - Take a pg_dump backup first.
 * - This script is tailored to the legacy schema shape exported on 2026-09-12.
 * - Historical Payment rows are NOT merged: each old Payment is an actual payment event.
 * - PaymentItem becomes the immutable billing snapshot + entity reference.
 * - Adds PaymentType value GROUP_SHIPPING for historical Japanese domestic shipping.
 */

import pg from "pg";
const { Pool } = pg;

const WRITE = process.argv.includes("--write");
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString: DATABASE_URL });

const EPS = 1e-7;
const n = (v) => (v == null ? null : Number(v));
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const cents = (v) => Math.round(Number(v) * 100);
const moneyEq = (a, b) => Math.abs(Number(a) - Number(b)) < 0.005;

function key2(a, b) {
  return `${a}:${b}`;
}

function parseGroupShipping(payment) {
  if (payment.type !== "LIST" || !payment.comment) return null;
  // Current dump contains: "另附 250 JPY 日本国内运费"
  const m = payment.comment.match(/(?:另附\s*)?(\d+(?:\.\d+)?)\s*JPY.*日本国内(?:运费|運費)/i);
  if (!m) return null;
  return {
    amount: Number(m[1]),
    currency: "JPY",
    name: "日本国内运费",
  };
}

function subsetSolutions(rows, targetValue, limit = 32) {
  const target = cents(targetValue);
  const values = rows.map((r) => cents(r.lineTotal));
  const solutions = [];

  function dfs(start, sum, picked) {
    if (solutions.length >= limit) return;
    if (sum === target) {
      solutions.push([...picked]);
      return;
    }
    if (sum > target) return;

    for (let i = start; i < rows.length; i++) {
      picked.push(i);
      dfs(i + 1, sum + values[i], picked);
      picked.pop();
    }
  }

  dfs(0, 0, []);
  return solutions.map((idxs) => idxs.map((i) => rows[i]));
}

function partitionOrders(payments, orders) {
  // Partition real orders among historical LIST payments.
  // We intentionally don't trust legacy PaymentItem blindly because the dump
  // contains repeated backfill rows on supplemental payments.
  const ps = [...payments].sort((a, b) => {
    const at = new Date(a.paidAt ?? a.createdAt).getTime();
    const bt = new Date(b.paidAt ?? b.createdAt).getTime();
    return at - bt || a.id - b.id;
  });

  const targetByPayment = new Map(
    ps.map((p) => {
      const shipping = parseGroupShipping(p);
      return [p.id, p.amount - (shipping?.amount ?? 0)];
    }),
  );

  const solutions = [];
  function rec(pi, remaining, groups) {
    if (solutions.length >= 16) return;
    if (pi === ps.length) {
      if (remaining.length === 0) solutions.push(groups.map((x) => [...x]));
      return;
    }

    const p = ps[pi];
    const target = targetByPayment.get(p.id);
    const subsets = subsetSolutions(remaining, target);

    for (const subset of subsets) {
      const selected = new Set(subset.map((o) => o.id));
      const rest = remaining.filter((o) => !selected.has(o.id));
      rec(pi + 1, rest, [...groups, subset]);
    }
  }

  rec(0, orders, []);

  if (solutions.length === 0) {
    throw new Error(
      `Cannot partition LIST orders for user=${ps[0]?.userId} group=${ps[0]?.refId}; ` +
        `payment targets=${ps.map((p) => targetByPayment.get(p.id)).join(",")}; ` +
        `order sum=${orders.reduce((s, o) => s + o.lineTotal, 0)}`,
    );
  }

  if (solutions.length === 1) {
    return new Map(ps.map((p, i) => [p.id, solutions[0][i]]));
  }

  // If repeated prices create several monetary solutions, choose the solution
  // best supported by legacy PaymentItem snapshots and timestamps.
  const score = (solution) => {
    let result = 0;
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      const cutoff = new Date(p.paidAt ?? p.createdAt).getTime();
      const legacy = p.legacyItems ?? [];
      for (const o of solution[i]) {
        const snapMatch = legacy.some(
          (x) =>
            x.name === o.itemName &&
            moneyEq(x.price, o.itemPrice) &&
            Number(x.count) === Number(o.count),
        );
        if (snapMatch) result += 100;
        const created = new Date(o.createdAt).getTime();
        if (created <= cutoff) result += 5;
        else result -= Math.min(50, Math.ceil((created - cutoff) / 86400000));
      }
    }
    return result;
  };

  const ranked = solutions
    .map((solution) => ({ solution, score: score(solution) }))
    .sort((a, b) => b.score - a.score);

  if (ranked.length > 1 && ranked[0].score === ranked[1].score) {
    throw new Error(
      `Ambiguous LIST partition for user=${ps[0]?.userId} group=${ps[0]?.refId}; ` +
        `top score=${ranked[0].score}`,
    );
  }

  return new Map(ps.map((p, i) => [p.id, ranked[0].solution[i]]));
}

function snapshotForOrder(payment, order, usedLegacyIds) {
  const legacy = (payment.legacyItems ?? []).find(
    (x) =>
      !usedLegacyIds.has(x.id) &&
      x.name === order.itemName &&
      moneyEq(x.price, order.itemPrice) &&
      Number(x.count) === Number(order.count),
  );

  if (legacy) {
    usedLegacyIds.add(legacy.id);
    return {
      name: legacy.name,
      image: legacy.image,
      description: legacy.description || `订单 #${order.id}`,
      price: legacy.price,
      count: legacy.count,
      total: legacy.total,
      unit: legacy.unit,
      currency: legacy.currency,
      currencyRate: legacy.currencyRate,
    };
  }

  return {
    name: order.itemName,
    image: order.itemImage,
    description: `订单 #${order.id}`,
    price: order.itemPrice,
    count: order.count,
    total: order.itemPrice * order.count,
    unit: "个",
    currency: payment.currency,
    currencyRate: payment.currencyRate,
  };
}

function settlePayment(payment, items) {
  const authoritativeTotal = round2(payment.amount * payment.currencyRate);
  let sum = 0;

  for (const item of items) {
    item.settledTotal = round2(item.total * item.currencyRate);
    sum = round2(sum + item.settledTotal);
  }

  // Preserve the old Payment-level amount exactly. The old payment page charged
  // Payment.amount * Payment.currencyRate as a whole, so line-level rounding may
  // differ by 0.01. Put the remainder on the final line.
  const delta = round2(authoritativeTotal - sum);
  if (Math.abs(delta) >= 0.005) {
    items[items.length - 1].settledTotal = round2(
      items[items.length - 1].settledTotal + delta,
    );
  }

  const check = round2(items.reduce((s, x) => s + x.settledTotal, 0));
  if (!moneyEq(check, authoritativeTotal)) {
    throw new Error(
      `Settlement mismatch Payment #${payment.id}: header=${authoritativeTotal}, items=${check}`,
    );
  }

  return authoritativeTotal;
}

async function loadLegacyData(client) {
  const [
    paymentsRes,
    paymentItemsRes,
    ordersRes,
    transitsRes,
    deliveriesRes,
  ] = await Promise.all([
    client.query(`
      SELECT id, "userId", "requestId", "refId", type, amount, method,
             currency, "currencyRate", "createdAt", "paidAt", comment
      FROM "Payment"
      ORDER BY id
    `),
    client.query(`
      SELECT id, "paymentId", name, image, description, price, count, total,
             unit, currency, "currencyRate"
      FROM "PaymentItem"
      ORDER BY id
    `),
    client.query(`
      SELECT
        o.id, o."userId", o."itemId", o."transitId", o.count, o.status,
        o."createdAt", o."updatedAt", o.comment,
        i."groupId", i.name AS "itemName", i.url AS "itemUrl",
        i.image AS "itemImage", i.price AS "itemPrice", i.weight AS "itemWeight"
      FROM "Order" o
      JOIN "Item" i ON i.id = o."itemId"
      ORDER BY o.id
    `),
    client.query(`
      SELECT id, type, "ticketNum", carrier, tax, fee, status, comment
      FROM "Transit"
      ORDER BY id
    `),
    client.query(`
      SELECT id, "userId", recipient, phone, address, company, status,
             comment, "ticketNum"
      FROM "Delivery"
      ORDER BY id
    `),
  ]);

  const paymentItemsByPayment = new Map();
  for (const row of paymentItemsRes.rows) {
    const item = {
      ...row,
      id: n(row.id),
      paymentId: n(row.paymentId),
      price: n(row.price),
      count: n(row.count),
      total: n(row.total),
      currencyRate: n(row.currencyRate),
    };
    if (!paymentItemsByPayment.has(item.paymentId)) {
      paymentItemsByPayment.set(item.paymentId, []);
    }
    paymentItemsByPayment.get(item.paymentId).push(item);
  }

  const payments = paymentsRes.rows.map((row) => ({
    ...row,
    id: n(row.id),
    userId: n(row.userId),
    refId: n(row.refId),
    amount: n(row.amount),
    currencyRate: n(row.currencyRate),
    legacyItems: paymentItemsByPayment.get(n(row.id)) ?? [],
  }));

  const orders = ordersRes.rows.map((row) => ({
    ...row,
    id: n(row.id),
    userId: n(row.userId),
    itemId: n(row.itemId),
    transitId: n(row.transitId),
    count: n(row.count),
    groupId: n(row.groupId),
    itemPrice: n(row.itemPrice),
    itemWeight: n(row.itemWeight),
    lineTotal: n(row.itemPrice) * n(row.count),
  }));

  return {
    payments,
    orders,
    transits: new Map(transitsRes.rows.map((r) => [n(r.id), r])),
    deliveries: new Map(deliveriesRes.rows.map((r) => [n(r.id), r])),
  };
}

function buildPaymentPlan(data) {
  const realOrders = data.orders.filter((o) => o.status !== "PENDING");
  const listPayments = data.payments.filter((p) => p.type === "LIST");

  const listPaymentsByPair = new Map();
  for (const p of listPayments) {
    const k = key2(p.userId, p.refId);
    if (!listPaymentsByPair.has(k)) listPaymentsByPair.set(k, []);
    listPaymentsByPair.get(k).push(p);
  }

  const ordersByPair = new Map();
  for (const o of realOrders) {
    const k = key2(o.userId, o.groupId);
    if (!ordersByPair.has(k)) ordersByPair.set(k, []);
    ordersByPair.get(k).push(o);
  }

  const listAssignment = new Map();
  for (const [k, ps] of listPaymentsByPair) {
    const os = ordersByPair.get(k) ?? [];
    const partition = partitionOrders(ps, os);
    for (const [paymentId, assigned] of partition) {
      listAssignment.set(paymentId, assigned);
    }
  }

  const plan = [];
  for (const payment of data.payments) {
    const items = [];

    if (payment.type === "LIST") {
      const assigned = listAssignment.get(payment.id) ?? [];
      const usedLegacyIds = new Set();

      for (const order of assigned) {
        const snap = snapshotForOrder(payment, order, usedLegacyIds);
        items.push({
          paymentId: payment.id,
          type: "LIST",
          refId: order.id,
          ...snap,
        });
      }

      const shipping = parseGroupShipping(payment);
      if (shipping) {
        items.push({
          paymentId: payment.id,
          type: "GROUP_SHIPPING",
          refId: payment.refId,
          name: shipping.name,
          image: null,
          description: `团购 #${payment.refId}`,
          price: shipping.amount,
          count: 1,
          total: shipping.amount,
          unit: "笔",
          currency: shipping.currency,
          currencyRate: payment.currencyRate,
        });
      }
    } else {
      // For TRANSIT / TAX / DELIVERY the legacy PaymentItem is already a good
      // immutable snapshot in this dump, so preserve it and only attach entity refs.
      if (payment.legacyItems.length > 0) {
        for (const legacy of payment.legacyItems) {
          items.push({
            paymentId: payment.id,
            type: payment.type,
            refId: payment.refId,
            name: legacy.name,
            image: legacy.image,
            description: legacy.description,
            price: legacy.price,
            count: legacy.count,
            total: legacy.total,
            unit: legacy.unit,
            currency: legacy.currency,
            currencyRate: legacy.currencyRate,
          });
        }
      } else if (payment.type === "TRANSIT" || payment.type === "TAX") {
        const transit = data.transits.get(payment.refId);
        if (!transit) throw new Error(`Missing Transit #${payment.refId} for Payment #${payment.id}`);
        items.push({
          paymentId: payment.id,
          type: payment.type,
          refId: payment.refId,
          name: payment.type === "TAX" ? "税费" : "国际运费",
          image: null,
          description: `${transit.carrier}${transit.ticketNum ? ` · ${transit.ticketNum}` : ""}`,
          price: payment.amount,
          count: 1,
          total: payment.amount,
          unit: "笔",
          currency: payment.currency,
          currencyRate: payment.currencyRate,
        });
      } else if (payment.type === "DELIVERY") {
        const delivery = data.deliveries.get(payment.refId);
        if (!delivery) throw new Error(`Missing Delivery #${payment.refId} for Payment #${payment.id}`);
        items.push({
          paymentId: payment.id,
          type: "DELIVERY",
          refId: payment.refId,
          name: "国内运费",
          image: null,
          description: `${delivery.recipient}${delivery.ticketNum ? ` · ${delivery.ticketNum}` : ""}`,
          price: payment.amount,
          count: 1,
          total: payment.amount,
          unit: "笔",
          currency: payment.currency,
          currencyRate: payment.currencyRate,
        });
      } else {
        throw new Error(`Unsupported Payment type ${payment.type} on #${payment.id}`);
      }
    }

    if (items.length === 0) {
      throw new Error(`Payment #${payment.id} produced no PaymentItem rows`);
    }

    const sourceSum = round2(items.reduce((s, x) => s + x.total, 0));
    if (!moneyEq(sourceSum, payment.amount)) {
      throw new Error(
        `Source total mismatch Payment #${payment.id}: payment=${payment.amount} items=${sourceSum}`,
      );
    }

    const settledAmount = settlePayment(payment, items);
    plan.push({ payment, items, settledAmount });
  }

  return plan;
}

function printPlanSummary(data, plan) {
  const pending = data.orders.filter((o) => o.status === "PENDING");
  const real = data.orders.length - pending.length;

  const byType = {};
  for (const p of data.payments) byType[p.type] = (byType[p.type] ?? 0) + 1;

  const newItemCount = plan.reduce((s, p) => s + p.items.length, 0);
  const groupShipping = plan
    .flatMap((p) => p.items)
    .filter((i) => i.type === "GROUP_SHIPPING");

  console.log("NextMyOrder migration preflight");
  console.log(`Orders: ${data.orders.length} (${pending.length} PENDING -> List, ${real} real -> snapshots)`);
  console.log(`Payments: ${data.payments.length} ${JSON.stringify(byType)}`);
  console.log(`New PaymentItem snapshots: ${newItemCount}`);
  console.log(`GROUP_SHIPPING items reconstructed: ${groupShipping.length}`);

  const special = [1, 32, 46, 47, 49, 50, 71];
  console.log("\nSpecial historical payments:");
  for (const id of special) {
    const p = plan.find((x) => x.payment.id === id);
    if (!p) continue;
    console.log(
      `  #${id}: ${p.items.length} item(s), source=${p.payment.amount} ${p.payment.currency}, ` +
        `settled=${p.settledAmount} CNY, refs=` +
        p.items.map((x) => `${x.type}:${x.refId}`).join(", "),
    );
  }

  console.log("\nNo historical Payment rows will be merged.");
}

async function applyMigration(client, plan) {
  // Enum values added in a transaction cannot be used until that transaction commits.
  // Add it once before the main atomic migration.
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'PaymentType'
          AND e.enumlabel = 'GROUP_SHIPPING'
      ) THEN
        ALTER TYPE "PaymentType" ADD VALUE 'GROUP_SHIPPING';
      END IF;
    END
    $$;
  `);

  await client.query("BEGIN");
  try {
    await client.query(`SELECT pg_advisory_xact_lock(hashtext('nextmyorder-20260912-migration'))`);

    // ---- List -> Member, PENDING Order -> new List ----
    const memberExists = await client.query(`SELECT to_regclass('"Member"') IS NOT NULL AS ok`);
    if (!memberExists.rows[0].ok) {
      await client.query(`ALTER TABLE "List" RENAME TO "Member"`);
    }

    await client.query(`ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "finalizedAt" timestamp`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "List" (
        "userId" bigint NOT NULL REFERENCES "User"(id),
        "itemId" bigint NOT NULL REFERENCES "Item"(id),
        count integer DEFAULT 1 NOT NULL,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY ("userId", "itemId")
      )
    `);

    await client.query(`
      INSERT INTO "List" ("userId", "itemId", count, "createdAt", "updatedAt")
      SELECT "userId", "itemId", count, "createdAt", "updatedAt"
      FROM "Order"
      WHERE status = 'PENDING'
      ON CONFLICT ("userId", "itemId")
      DO UPDATE SET
        count = EXCLUDED.count,
        "updatedAt" = EXCLUDED."updatedAt"
    `);

    // ---- Order snapshots ----
    await client.query(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "groupId" bigint`);
    await client.query(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "itemName" text`);
    await client.query(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "itemUrl" text`);
    await client.query(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "itemImage" text`);
    await client.query(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "itemPrice" numeric`);
    await client.query(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "itemWeight" numeric`);

    await client.query(`
      UPDATE "Order" o
      SET
        "groupId" = i."groupId",
        "itemName" = i.name,
        "itemUrl" = i.url,
        "itemImage" = i.image,
        "itemPrice" = i.price,
        "itemWeight" = i.weight
      FROM "Item" i
      WHERE i.id = o."itemId"
        AND (
          o."groupId" IS NULL OR o."itemName" IS NULL OR
          o."itemUrl" IS NULL OR o."itemPrice" IS NULL
        )
    `);

    // Reconstruct "finalized" state before removing legacy Payment.type/refId.
    await client.query(`
      WITH finalized AS (
        SELECT
          o."userId",
          o."groupId",
          COALESCE(
            MIN(p."createdAt") FILTER (
              WHERE p.type = 'LIST'
                AND p."refId" = o."groupId"
                AND p."userId" = o."userId"
            ),
            MIN(o."updatedAt")
          ) AS "finalizedAt"
        FROM "Order" o
        LEFT JOIN "Payment" p
          ON p."userId" = o."userId"
         AND p.type = 'LIST'
         AND p."refId" = o."groupId"
        WHERE o.status <> 'PENDING'
        GROUP BY o."userId", o."groupId"
      )
      UPDATE "Member" m
      SET "finalizedAt" = f."finalizedAt"
      FROM finalized f
      WHERE m."userId" = f."userId"
        AND m."groupId" = f."groupId"
        AND m."finalizedAt" IS NULL
    `);

    await client.query(`DELETE FROM "Order" WHERE status = 'PENDING'`);

    const orderNulls = await client.query(`
      SELECT count(*)::int AS n
      FROM "Order"
      WHERE "groupId" IS NULL OR "itemName" IS NULL OR
            "itemUrl" IS NULL OR "itemPrice" IS NULL
    `);
    if (orderNulls.rows[0].n !== 0) {
      throw new Error(`Order snapshot backfill left ${orderNulls.rows[0].n} invalid row(s)`);
    }

    await client.query(`ALTER TABLE "Order" ALTER COLUMN "groupId" SET NOT NULL`);
    await client.query(`ALTER TABLE "Order" ALTER COLUMN "itemName" SET NOT NULL`);
    await client.query(`ALTER TABLE "Order" ALTER COLUMN "itemUrl" SET NOT NULL`);
    await client.query(`ALTER TABLE "Order" ALTER COLUMN "itemPrice" SET NOT NULL`);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conrelid = '"Order"'::regclass
            AND contype = 'f'
            AND pg_get_constraintdef(oid) LIKE '%("groupId")%REFERENCES "Group"%'
        ) THEN
          ALTER TABLE "Order"
          ADD CONSTRAINT "Order_groupId_Group_id_fk"
          FOREIGN KEY ("groupId") REFERENCES "Group"(id);
        END IF;
      END
      $$;
    `);

    // Match target Item nullability. Preflight dump has no NULL names/prices.
    await client.query(`ALTER TABLE "Item" ALTER COLUMN name SET NOT NULL`);
    await client.query(`ALTER TABLE "Item" ALTER COLUMN price SET NOT NULL`);

    // ---- Payment aggregate + PaymentItem snapshot/reference ----
    await client.query(`ALTER TABLE "PaymentItem" ADD COLUMN IF NOT EXISTS type "PaymentType"`);
    await client.query(`ALTER TABLE "PaymentItem" ADD COLUMN IF NOT EXISTS "refId" bigint`);
    await client.query(`ALTER TABLE "PaymentItem" ADD COLUMN IF NOT EXISTS "settledTotal" numeric`);
    await client.query(
      `ALTER TABLE "PaymentItem" ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP`,
    );

    // Legacy Drizzle declared paymentId as bigserial. It must be a normal FK bigint.
    await client.query(`ALTER TABLE "PaymentItem" ALTER COLUMN "paymentId" DROP DEFAULT`);

    // Rebuild all PaymentItems from the validated plan.
    await client.query(`DELETE FROM "PaymentItem"`);

    for (const entry of plan) {
      for (const item of entry.items) {
        await client.query(
          `
            INSERT INTO "PaymentItem" (
              "paymentId", type, "refId", name, image, description,
              price, count, total, unit, currency, "currencyRate",
              "settledTotal", "createdAt"
            ) VALUES (
              $1, $2::"PaymentType", $3, $4, $5, $6,
              $7, $8, $9, $10, $11, $12,
              $13, $14
            )
          `,
          [
            item.paymentId,
            item.type,
            item.refId,
            item.name,
            item.image,
            item.description,
            item.price,
            item.count,
            item.total,
            item.unit,
            item.currency,
            item.currencyRate,
            item.settledTotal,
            entry.payment.createdAt,
          ],
        );
      }

      await client.query(
        `UPDATE "Payment" SET amount = $1, currency = 'CNY' WHERE id = $2`,
        [entry.settledAmount, entry.payment.id],
      );
    }

    await client.query(`ALTER TABLE "PaymentItem" ALTER COLUMN "paymentId" SET NOT NULL`);
    await client.query(`ALTER TABLE "PaymentItem" ALTER COLUMN type SET NOT NULL`);
    await client.query(`ALTER TABLE "PaymentItem" ALTER COLUMN "refId" SET NOT NULL`);
    await client.query(`ALTER TABLE "PaymentItem" ALTER COLUMN "settledTotal" SET NOT NULL`);
    await client.query(`ALTER TABLE "PaymentItem" ALTER COLUMN "createdAt" SET NOT NULL`);

    // Reset the id sequence after rebuilding PaymentItem.
    await client.query(`
      SELECT setval(
        pg_get_serial_sequence('"PaymentItem"', 'id'),
        COALESCE((SELECT MAX(id) FROM "PaymentItem"), 1),
        (SELECT COUNT(*) > 0 FROM "PaymentItem")
      )
    `);

    await client.query(`ALTER TABLE "Payment" DROP COLUMN "refId"`);
    await client.query(`ALTER TABLE "Payment" DROP COLUMN type`);
    await client.query(`ALTER TABLE "Payment" DROP COLUMN "currencyRate"`);

    // Drop the accidental bigserial sequence that used to belong to PaymentItem.paymentId.
    await client.query(`DROP SEQUENCE IF EXISTS "PaymentItem_paymentId_seq"`);

    // Final invariants.
    const badPaymentTotals = await client.query(`
      SELECT p.id, p.amount, COALESCE(SUM(pi."settledTotal"), 0) AS item_total
      FROM "Payment" p
      LEFT JOIN "PaymentItem" pi ON pi."paymentId" = p.id
      GROUP BY p.id, p.amount
      HAVING ABS(p.amount - COALESCE(SUM(pi."settledTotal"), 0)) > 0.004
    `);
    if (badPaymentTotals.rows.length > 0) {
      throw new Error(
        `Payment total invariant failed: ${JSON.stringify(badPaymentTotals.rows)}`,
      );
    }

    const emptyPayments = await client.query(`
      SELECT p.id
      FROM "Payment" p
      LEFT JOIN "PaymentItem" pi ON pi."paymentId" = p.id
      GROUP BY p.id
      HAVING COUNT(pi.id) = 0
    `);
    if (emptyPayments.rows.length > 0) {
      throw new Error(
        `Payments without items: ${emptyPayments.rows.map((x) => x.id).join(", ")}`,
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function main() {
  const client = await pool.connect();
  try {
    // This script intentionally validates the legacy schema first.
    const shape = await client.query(`
      SELECT
        EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'Payment' AND column_name = 'type'
        ) AS payment_is_legacy,
        EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'Order' AND column_name = 'itemName'
        ) AS order_has_snapshot,
        to_regclass('"Member"') IS NOT NULL AS member_exists
    `);

    if (!shape.rows[0].payment_is_legacy) {
      throw new Error(
        "Payment.type is already absent. This database appears already migrated; refusing to run.",
      );
    }

    const data = await loadLegacyData(client);
    const plan = buildPaymentPlan(data);
    printPlanSummary(data, plan);

    if (!WRITE) {
      console.log("\nDry run only. Re-run with --write after reviewing the output.");
      return;
    }

    console.log("\nApplying migration...");
    await applyMigration(client, plan);
    console.log("Migration committed successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("\nMigration failed:");
  console.error(error);
  process.exitCode = 1;
});

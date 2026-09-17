import "dotenv/config";
import { Pool } from "pg";

const shouldWrite = process.argv.includes("--write");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: databaseUrl });

type PaymentType = "LIST" | "TAX" | "TRANSIT" | "DELIVERY";

type LegacyPayment = {
    id: string;
    userId: string;
    refId: string;
    type: PaymentType;
    amount: string;
    currency: string;
    currencyRate: string;
};

type LegacyPaymentItem = {
    id: string;
    name: string;
    image: string | null;
    description: string | null;
    price: string;
    count: number;
    total: string;
    unit: string;
    currency: string;
    currencyRate: string;
};

type OrderSnapshot = {
    id: string;
    itemName: string;
    itemImage: string | null;
    itemPrice: string;
    count: number;
};

type SnapshotRow = {
    paymentId: string;
    type: PaymentType;
    refId: string;
    name: string;
    image: string | null;
    description: string | null;
    price: number;
    count: number;
    total: number;
    unit: string;
    currency: string;
    currencyRate: number;
    settledTotal: number;
};

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const hasColumn = async (table: string, column: string) => {
    const result = await pool.query<{ exists: boolean }>(
        `
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = current_schema()
                  AND table_name = $1
                  AND column_name = $2
            ) AS exists
        `,
        [table, column]
    );
    return result.rows[0]?.exists ?? false;
};

const buildRows = async (payment: LegacyPayment): Promise<SnapshotRow[]> => {
    const existingResult = await pool.query<LegacyPaymentItem>(
        `SELECT * FROM "PaymentItem" WHERE "paymentId" = $1 ORDER BY "id"`,
        [payment.id]
    );
    const existing = existingResult.rows;

    const toSnapshot = (
        source: LegacyPaymentItem,
        type: PaymentType,
        refId: string
    ): SnapshotRow => {
        const total = Number(source.total);
        const rate = Number(source.currencyRate);
        return {
            paymentId: payment.id,
            type,
            refId,
            name: source.name,
            image: source.image,
            description: source.description,
            price: Number(source.price),
            count: source.count,
            total,
            unit: source.unit,
            currency: source.currency,
            currencyRate: rate,
            settledTotal: money(total * rate),
        };
    };

    if (payment.type === "LIST") {
        const orderResult = await pool.query<OrderSnapshot>(
            `
                SELECT "id", "itemName", "itemImage", "itemPrice", "count"
                FROM "Order"
                WHERE "userId" = $1 AND "groupId" = $2
                ORDER BY "id"
            `,
            [payment.userId, payment.refId]
        );
        const orders = orderResult.rows;

        if (orders.length === 0) {
            return [];
        }

        if (existing.length === 0) {
            const rate = Number(payment.currencyRate);
            return orders.map((order) => {
                const price = Number(order.itemPrice);
                const total = price * order.count;
                return {
                    paymentId: payment.id,
                    type: "LIST",
                    refId: order.id,
                    name: order.itemName,
                    image: order.itemImage,
                    description: `订单 #${order.id}`,
                    price,
                    count: order.count,
                    total,
                    unit: "个",
                    currency: payment.currency,
                    currencyRate: rate,
                    settledTotal: money(total * rate),
                };
            });
        }

        const unused = new Set(orders.map((order) => order.id));
        const rows: SnapshotRow[] = [];

        for (const item of existing) {
            const candidates = orders.filter((order) => unused.has(order.id) && order.itemName === item.name);
            const exact = candidates.find(
                (order) => order.count === item.count && Number(order.itemPrice) === Number(item.price)
            );
            const countMatch = candidates.find((order) => order.count === item.count);
            const matched = exact ?? countMatch ?? (candidates.length === 1 ? candidates[0] : undefined);

            if (!matched) {
                return [];
            }

            unused.delete(matched.id);
            rows.push(toSnapshot(item, "LIST", matched.id));
        }

        return rows;
    }

    if (existing.length > 0) {
        return existing.map((item) => toSnapshot(item, payment.type, payment.refId));
    }

    const amount = Number(payment.amount);
    const rate = Number(payment.currencyRate);
    const common = {
        paymentId: payment.id,
        type: payment.type,
        refId: payment.refId,
        image: null,
        price: amount,
        count: 1,
        total: amount,
        unit: "笔",
        currency: payment.currency,
        currencyRate: rate,
        settledTotal: money(amount * rate),
    };

    if (payment.type === "TAX" || payment.type === "TRANSIT") {
        const result = await pool.query<{ carrier: string; ticketNum: string | null }>(
            `SELECT "carrier", "ticketNum" FROM "Transit" WHERE "id" = $1 LIMIT 1`,
            [payment.refId]
        );
        const transit = result.rows[0];
        if (!transit) return [];

        return [
            {
                ...common,
                name: payment.type === "TAX" ? "税费" : "国际运费",
                description: `${transit.carrier}${transit.ticketNum ? ` · ${transit.ticketNum}` : ""}`,
            },
        ];
    }

    const result = await pool.query<{ recipient: string; ticketNum: string | null }>(
        `SELECT "recipient", "ticketNum" FROM "Delivery" WHERE "id" = $1 LIMIT 1`,
        [payment.refId]
    );
    const delivery = result.rows[0];
    if (!delivery) return [];

    return [
        {
            ...common,
            name: "国内运费",
            description: `${delivery.recipient}${delivery.ticketNum ? ` · ${delivery.ticketNum}` : ""}`,
        },
    ];
};

const run = async () => {
    try {
        const legacyTypeExists = await hasColumn("Payment", "type");
        const legacyRefExists = await hasColumn("Payment", "refId");
        const legacyRateExists = await hasColumn("Payment", "currencyRate");

        if (!legacyTypeExists || !legacyRefExists || !legacyRateExists) {
            console.log("Payment header no longer contains legacy type/refId/currencyRate columns. Nothing to migrate.");
            return;
        }

        const paymentResult = await pool.query<LegacyPayment>(`
            SELECT "id", "userId", "refId", "type", "amount", "currency", "currencyRate"
            FROM "Payment"
            ORDER BY "id"
        `);

        const prepared = new Map<string, SnapshotRow[]>();
        const unresolved: LegacyPayment[] = [];

        for (const payment of paymentResult.rows) {
            const rows = await buildRows(payment);
            if (rows.length === 0) {
                unresolved.push(payment);
            } else {
                prepared.set(payment.id, rows);
            }
        }

        const itemCount = [...prepared.values()].reduce((sum, rows) => sum + rows.length, 0);
        console.log("Payment/PaymentItem split migration");
        console.log(`Payments: ${paymentResult.rows.length}`);
        console.log(`Payment items to preserve/create: ${itemCount}`);
        console.log(`Unresolved payments: ${unresolved.length}`);
        for (const payment of unresolved) {
            console.error(`  Payment #${payment.id}: ${payment.type} refId=${payment.refId}`);
        }

        if (unresolved.length > 0) {
            throw new Error("Unresolved payments exist. Migration was not applied.");
        }

        if (!shouldWrite) {
            console.log("\nDry run only. Re-run with --write to apply the migration.");
            return;
        }

        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(`ALTER TABLE "PaymentItem" ADD COLUMN IF NOT EXISTS "type" "PaymentType"`);
            await client.query(`ALTER TABLE "PaymentItem" ADD COLUMN IF NOT EXISTS "refId" bigint`);
            await client.query(`ALTER TABLE "PaymentItem" ADD COLUMN IF NOT EXISTS "settledTotal" numeric`);
            await client.query(
                `ALTER TABLE "PaymentItem" ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP`
            );

            for (const [paymentId, rows] of prepared) {
                await client.query(`DELETE FROM "PaymentItem" WHERE "paymentId" = $1`, [paymentId]);

                for (const row of rows) {
                    await client.query(
                        `
                            INSERT INTO "PaymentItem" (
                                "paymentId", "type", "refId", "name", "image", "description",
                                "price", "count", "total", "unit", "currency", "currencyRate", "settledTotal"
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                        `,
                        [
                            row.paymentId,
                            row.type,
                            row.refId,
                            row.name,
                            row.image,
                            row.description,
                            row.price,
                            row.count,
                            row.total,
                            row.unit,
                            row.currency,
                            row.currencyRate,
                            row.settledTotal,
                        ]
                    );
                }

                const settledAmount = money(rows.reduce((sum, row) => sum + row.settledTotal, 0));
                await client.query(`UPDATE "Payment" SET "amount" = $1, "currency" = 'CNY' WHERE "id" = $2`, [
                    settledAmount,
                    paymentId,
                ]);
            }

            await client.query(`ALTER TABLE "PaymentItem" ALTER COLUMN "paymentId" SET NOT NULL`);
            await client.query(`ALTER TABLE "PaymentItem" ALTER COLUMN "type" SET NOT NULL`);
            await client.query(`ALTER TABLE "PaymentItem" ALTER COLUMN "refId" SET NOT NULL`);
            await client.query(`ALTER TABLE "PaymentItem" ALTER COLUMN "settledTotal" SET NOT NULL`);
            await client.query(`ALTER TABLE "PaymentItem" ALTER COLUMN "createdAt" SET NOT NULL`);
            await client.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conrelid = '"PaymentItem"'::regclass
                          AND contype = 'p'
                    ) THEN
                        ALTER TABLE "PaymentItem" ADD PRIMARY KEY ("id");
                    END IF;
                END
                $$;
            `);

            await client.query(`ALTER TABLE "Payment" DROP COLUMN "refId"`);
            await client.query(`ALTER TABLE "Payment" DROP COLUMN "type"`);
            await client.query(`ALTER TABLE "Payment" DROP COLUMN "currencyRate"`);
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }

        console.log("Migration completed. Payment is now an aggregate and references live on PaymentItem snapshots.");
    } finally {
        await pool.end();
    }
};

run().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});

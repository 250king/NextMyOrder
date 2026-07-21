import "dotenv/config";
import { and, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
    Delivery,
    Item,
    Order,
    Payment,
    PaymentItem,
    Transit,
} from "../src/service/db/schema";

const shouldWrite = process.argv.includes("--write");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

type NewPaymentItem = typeof PaymentItem.$inferInsert;
type PaymentRow = typeof Payment.$inferSelect;

const commonFields = (payment: PaymentRow) => ({
    paymentId: payment.id,
    currency: payment.currency,
    currencyRate: payment.currencyRate,
});

const buildItems = async (payment: PaymentRow): Promise<NewPaymentItem[]> => {
    switch (payment.type) {
        case "LIST": {
            const rows = await db
                .select({
                    name: Item.name,
                    image: Item.image,
                    price: Item.price,
                    count: Order.count,
                })
                .from(Order)
                .innerJoin(Item, eq(Item.id, Order.itemId))
                .where(and(eq(Order.userId, payment.userId), eq(Item.groupId, payment.refId)));

            return rows.map((row) => ({
                ...commonFields(payment),
                name: row.name,
                image: row.image,
                description: `团购 #${payment.refId}`,
                price: row.price,
                count: row.count,
                total: row.price * row.count,
            }));
        }

        case "TAX": {
            const [transit] = await db
                .select()
                .from(Transit)
                .where(eq(Transit.id, payment.refId))
                .limit(1);
            if (!transit) return [];

            return [{
                ...commonFields(payment),
                name: "税费",
                description: `${transit.carrier} 转运 #${transit.id}`,
                price: payment.amount,
                count: 1,
                total: payment.amount,
                unit: "笔",
            }];
        }

        case "TRANSIT": {
            const [transit] = await db
                .select()
                .from(Transit)
                .where(eq(Transit.id, payment.refId))
                .limit(1);
            if (!transit) return [];

            return [{
                ...commonFields(payment),
                name: "国际运费",
                description: `${transit.carrier}${transit.ticketNum ? ` · ${transit.ticketNum}` : ""}`,
                price: payment.amount,
                count: 1,
                total: payment.amount,
                unit: "笔",
            }];
        }

        case "DELIVERY": {
            const [delivery] = await db
                .select()
                .from(Delivery)
                .where(eq(Delivery.id, payment.refId))
                .limit(1);
            if (!delivery) return [];

            return [{
                ...commonFields(payment),
                name: "国内运费",
                description: `${delivery.recipient}${delivery.ticketNum ? ` · ${delivery.ticketNum}` : ""}`,
                price: payment.amount,
                count: 1,
                total: payment.amount,
                unit: "笔",
            }];
        }
    }
};

const main = async () => {
    const payments = await db.select().from(Payment);
    const existing = payments.length === 0
        ? []
        : await db
            .select({ paymentId: PaymentItem.paymentId })
            .from(PaymentItem)
            .where(inArray(PaymentItem.paymentId, payments.map((payment) => payment.id)));
    const completedPaymentIds = new Set(existing.map((item) => item.paymentId));

    let itemCount = 0;
    let skippedCount = 0;
    const unresolved: PaymentRow[] = [];

    for (const payment of payments) {
        if (completedPaymentIds.has(payment.id)) {
            skippedCount++;
            continue;
        }

        const items = await buildItems(payment);
        if (items.length === 0) {
            unresolved.push(payment);
            continue;
        }

        if (shouldWrite) {
            await db.transaction(async (tx) => {
                const existingItems = await tx
                    .select({ id: PaymentItem.id })
                    .from(PaymentItem)
                    .where(eq(PaymentItem.paymentId, payment.id))
                    .limit(1);
                if (existingItems.length === 0) {
                    await tx.insert(PaymentItem).values(items);
                }
            });
        }

        itemCount += items.length;
        console.log(`${shouldWrite ? "WRITE" : "PREVIEW"} Payment #${payment.id}: ${items.length} item(s)`);
    }

    console.log(`\nPayments: ${payments.length}`);
    console.log(`Items ${shouldWrite ? "written" : "to write"}: ${itemCount}`);
    console.log(`Skipped (already populated): ${skippedCount}`);
    console.log(`Unresolved: ${unresolved.length}`);
    for (const payment of unresolved) {
        console.error(`  Payment #${payment.id}: ${payment.type} refId=${payment.refId}`);
    }

    if (!shouldWrite) {
        console.log("\nDry run only. Re-run with --write to insert the rows.");
    }

    if (unresolved.length > 0) process.exitCode = 1;
};

const run = async () => {
    try {
        await main();
    } finally {
        await pool.end();
    }
};

run().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});

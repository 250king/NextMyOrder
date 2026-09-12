import "dotenv/config";
import { Pool } from "pg";

const shouldWrite = process.argv.includes("--write");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: databaseUrl });

const preview = async () => {
    const [{ rows: tableRows }, { rows: orderRows }] = await Promise.all([
        pool.query<{ list_exists: boolean; member_exists: boolean; demand_exists: boolean }>(`
            SELECT
                to_regclass('"List"') IS NOT NULL AS list_exists,
                to_regclass('"Member"') IS NOT NULL AS member_exists,
                to_regclass('"Demand"') IS NOT NULL AS demand_exists
        `),
        pool.query<{ total: string; pending: string; finalized: string }>(`
            SELECT
                count(*)::text AS total,
                count(*) FILTER (WHERE status = 'PENDING')::text AS pending,
                count(*) FILTER (WHERE status <> 'PENDING')::text AS finalized
            FROM "Order"
        `),
    ]);

    const tables = tableRows[0];
    const orders = orderRows[0];

    console.log("List/order split migration");
    console.log(`List table: ${tables.list_exists ? "yes" : "no"}`);
    console.log(`Member table: ${tables.member_exists ? "yes" : "no"}`);
    console.log(`Legacy Demand table: ${tables.demand_exists ? "yes" : "no"}`);
    console.log(`Orders: ${orders.total}`);
    console.log(`Legacy pending orders to move to List only: ${orders.pending}`);
    console.log(`Existing finalized orders to preserve: ${orders.finalized}`);
};

const migrate = async () => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(`
            DO $$
            BEGIN
                IF to_regclass('"Member"') IS NULL
                   AND to_regclass('"List"') IS NOT NULL
                   AND EXISTS (
                       SELECT 1 FROM information_schema.columns
                       WHERE table_schema = current_schema()
                         AND table_name = 'List'
                         AND column_name = 'groupId'
                   ) THEN
                    ALTER TABLE "List" RENAME TO "Member";
                END IF;
            END
            $$;
        `);
        await client.query(`ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "finalizedAt" timestamp`);
        await client.query(`
            DO $$
            BEGIN
                IF to_regclass('"List"') IS NULL AND to_regclass('"Demand"') IS NOT NULL THEN
                    ALTER TABLE "Demand" RENAME TO "List";
                END IF;
            END
            $$;
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS "List" (
                "userId" bigint NOT NULL REFERENCES "User"("id"),
                "itemId" bigint NOT NULL REFERENCES "Item"("id"),
                "count" integer DEFAULT 1 NOT NULL,
                "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                PRIMARY KEY ("userId", "itemId")
            )
        `);
        await client.query(`
            INSERT INTO "List" ("userId", "itemId", "count", "createdAt", "updatedAt")
            SELECT "userId", "itemId", "count", "createdAt", "updatedAt" FROM "Order"
            ON CONFLICT ("userId", "itemId")
            DO UPDATE SET "count" = EXCLUDED."count", "updatedAt" = EXCLUDED."updatedAt"
        `);
        await client.query(`
            UPDATE "Member" AS member
            SET "finalizedAt" = finalized."finalizedAt"
            FROM (
                SELECT orders."userId" AS "userId", items."groupId" AS "groupId", max(orders."updatedAt") AS "finalizedAt"
                FROM "Order" AS orders
                INNER JOIN "Item" AS items ON items."id" = orders."itemId"
                WHERE orders."status" <> 'PENDING'
                GROUP BY orders."userId", items."groupId"
            ) AS finalized
            WHERE member."userId" = finalized."userId"
              AND member."groupId" = finalized."groupId"
              AND member."finalizedAt" IS NULL
        `);
        const deleted = await client.query(`DELETE FROM "Order" WHERE "status" = 'PENDING'`);
        await client.query("COMMIT");
        console.log(`Migration completed. Removed ${deleted.rowCount ?? 0} legacy pending order row(s).`);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const run = async () => {
    try {
        await preview();
        if (!shouldWrite) {
            console.log("\nDry run only. Re-run with --write to apply the migration.");
            return;
        }
        await migrate();
    } finally {
        await pool.end();
    }
};

run().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});

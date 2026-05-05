import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as relations from "@/service/db/relations";
import * as schema from "@/service/db/schema";
import { env } from "@/util/env";

const pool = new Pool({
    connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, {
    schema: {
        ...schema,
        ...relations,
    }
})

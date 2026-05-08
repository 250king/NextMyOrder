import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as relations from "@/service/db/relations";
import * as schema from "@/service/db/schema";
import { env } from "@/util/env";

const createDb = () => {
    const pool = new Pool({
        connectionString: env.DATABASE_URL,
    });

    return drizzle(pool, {
        schema: {
            ...schema,
            ...relations,
        },
    });
};

let dbInstance: ReturnType<typeof createDb> | undefined;

const getDb = () => {
    dbInstance ??= createDb();
    return dbInstance;
};

export const db = new Proxy({} as ReturnType<typeof createDb>, {
    get: (_, prop, receiver) => Reflect.get(getDb(), prop, receiver),
});

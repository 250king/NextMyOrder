import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    DATABASE_URL: z.url().nonempty(),
    CLIENT_ID: z.string().nonempty(),
    CLIENT_SECRET: z.string().nonempty(),
    OIDC_URI: z.url().nonempty(),
    REDIRECT_URI: z.url().nonempty(),
    RESOURCE_URI: z.url().nonempty(),
    REDIS_URL: z.url().nonempty(),
    SESSION_PREFIX: z.string().nonempty().default("session"),
    SESSION_COOKIE: z.string().nonempty().default("__sid"),
    SESSION_TTL: z.int().positive().default(60 * 60 * 24 * 7),
    JD_CUSTOMER_ID: z.string().nonempty(),
    JD_SHOP_ID: z.string().nonempty(),
    JD_KEY: z.string().nonempty(),
    JD_SECRET: z.string().nonempty(),
    JD_CALLBACK_URL: z.url().nonempty(),
});

export const env = envSchema.parse(process.env);

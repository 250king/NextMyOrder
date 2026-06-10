import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
    DATABASE_URL: z.url().nonempty().default("postgres://localhost:5432/nestmyorder"),
    BASE_URL: z.url().nonempty().default("http://localhost:3000"),
    CLIENT_ID: z.string().nonempty(),
    CLIENT_SECRET: z.string().nonempty(),
    OIDC_URI: z.url().nonempty().default("httsp://example.com/.well-known/openid-configuration"),
    REDIS_URL: z.url().nonempty().default("http://localhost:6379"),
    SESSION_PREFIX: z.string().nonempty().default("session"),
    SESSION_COOKIE_NAME: z.string().nonempty().default("__sid"),
    SESSION_TTL: z
        .int()
        .positive()
        .default(60 * 60 * 24 * 7),
    JD_CUSTOMER_ID: z.string().nonempty(),
    JD_SHOP_ID: z.string().nonempty(),
    JD_KEY: z.string().nonempty(),
    JD_SECRET: z.string().nonempty(),
    JD_CALLBACK_URL: z.url().nonempty().default("http://localhost:3000/api/callback/deliveries"),
    AMAP_KEY: z.string().nonempty(),
    KD100_CALLBACK_URL: z.url().nonempty().default("http://localhost:3000/api/callback/payments"),
    KD100_KEY: z.string().nonempty(),
    KD100_SECRET: z.string().nonempty(),
    KD100_NONCE: z.string().nonempty(),
});

const result = envSchema.safeParse(process.env);

export const env = result.success ? result.data : (process.env as unknown as z.infer<typeof envSchema>);

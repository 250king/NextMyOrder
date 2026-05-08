import { z } from "zod";

const isNextBuild =
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build";

const buildEnv = {
    NODE_ENV: "production",
    DATABASE_URL: "postgres://placeholder:placeholder@localhost:5432/placeholder",
    CLIENT_ID: "placeholder",
    CLIENT_SECRET: "placeholder",
    OIDC_URI: "http://localhost",
    REDIRECT_URI: "http://localhost/callback",
    RESOURCE_URI: "http://localhost",
    REDIS_URL: "redis://localhost:6379/0",
    JD_CUSTOMER_ID: "placeholder",
    JD_SHOP_ID: "placeholder",
    JD_KEY: "placeholder",
    JD_SECRET: "placeholder",
    JD_CALLBACK_URL: "http://localhost/api/callback/payment",
} satisfies Partial<NodeJS.ProcessEnv>;

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
    SESSION_COOKIE_NAME: z.string().nonempty().default("__sid"),
    SESSION_COOKIE_SECURE: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
    SESSION_TTL: z.int().positive().default(60 * 60 * 24 * 7),
    JD_CUSTOMER_ID: z.string().nonempty(),
    JD_SHOP_ID: z.string().nonempty(),
    JD_KEY: z.string().nonempty(),
    JD_SECRET: z.string().nonempty(),
    JD_CALLBACK_URL: z.url().nonempty(),
});

export const env = envSchema.parse(isNextBuild ? { ...buildEnv, ...process.env } : process.env);

import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    API_URL: z.url(),
    CLIENT_ID: z.string().nonempty(),
    CLIENT_SECRET: z.string().nonempty(),
    OIDC_URI: z.url(),
    REDIRECT_URI: z.url(),
    RESOURCE_URI: z.url(),
    REDIS_URL: z.url(),
    SESSION_PREFIX: z.string().default(""),
    SESSION_COOKIE: z.string().default("myorder_sid"),
    SESSION_TTL: z.int().default(60 * 60 * 24 * 7)
});

export const env = envSchema.parse(process.env);

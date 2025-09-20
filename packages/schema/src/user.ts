import {z} from "zod/v4";

export const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    qq: z.string().regex(/^\d+$/),
    email: z.email().nullish().catch(null),
    phone: z.string().regex(/^1\d{10}$/).nullish().catch(null),
    address: z.string().nullish().catch(null),
    createdAt: z.date().default(new Date()),
});

export const userData = userSchema.omit({
    createdAt: true,
}).extend({
    qqs: z.string().regex(/^\d+$/).array(),
});

export type UserSchema = z.infer<typeof userSchema>

export type UserData = z.infer<typeof userData>;

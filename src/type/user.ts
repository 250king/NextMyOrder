import {number, object, string, infer as zInfer, coerce} from "zod";

export const userSchema = object({
    id: number(),
    qq: string().regex(/^\d+$/),
    name: string(),
    email: string().email().nullable().default(null),
    phone: string().regex(/^1\d{10}$/).nullable().default(null),
    address: string().nullable().default(null),
    createAt: coerce.date().default(new Date()),
})

export type UserSchema = zInfer<typeof userSchema>

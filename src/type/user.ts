import { z } from "zod";
import { User } from "@/service/db/schema";

export type UserResult = typeof User.$inferSelect

export const userSchema = z.object({
    username: z.string().nullable(),
    name: z.string().nullable(),
    email: z.email().nullable(),
    custom_data: z.object({
        qq: z.string()
    })
})

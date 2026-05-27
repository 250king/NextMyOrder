import { z } from "zod";
import { User } from "@/service/db/schema";

export type UserResult = typeof User.$inferSelect

export const userSchema = z.object({
    username: z.string().optional(),
    name: z.string().optional(),
    email: z.email().optional(),
    custom_data: z.object({
        qq: z.string()
    })
})

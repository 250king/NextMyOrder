import { user } from "@/service/db/schema";

export type UserInfo = {
    username?: string,
    name: string,
    primary_email: string,
    custom_data: {
        qq: string,
    }
}

export type UserResult = typeof user.$inferSelect

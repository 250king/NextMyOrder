import {number, object, string, infer as zInfer, coerce} from "zod";
import {UserSchema} from "@/type/user";

export const statusMap = {
    activated: {
        text: "进行中"
    },
    stopped: {
        text: "已截单"
    },
    finished: {
        text: "已结束"
    }
}

export const groupSchema = object({
    id: number(),
    qq: string().regex(/^\d+$/),
    name: string(),
    status: string()
})

export const joinSchema = object({
    userId: number(),
    groupId: number(),
    createAt: coerce.date().default(new Date())
})

export type GroupData = GroupSchema & {
    status: string
}

export type JoinData = JoinSchema & {
    user: UserSchema,
    group: GroupSchema
}

export type GroupSchema = zInfer<typeof groupSchema>

export type JoinSchema = zInfer<typeof joinSchema>

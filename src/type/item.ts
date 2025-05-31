import {boolean, number, object, string, infer as zInfer} from "zod";

export const statusMap = {
    true: {
        text: "已通过"
    },
    false: {
        text: "未通过"
    }
}

export const itemSchema = object({
    id: number(),
    groupId: number(),
    name: string(),
    url: string().url(),
    price: number(),
    weight: number().nullable().default(null),
    allowed: boolean().default(false)
})

export type ItemSchema = zInfer<typeof itemSchema>

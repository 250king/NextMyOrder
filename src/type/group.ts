import {number, object, string, boolean, infer as zInfer} from "zod";
import {UserSchema} from "@/type/user";
import {DeliverySchema} from "@/type/delivery";

export const groupStatusMap = {
    activated: {text: "进行中"},
    stopped: {text: "已截单"},
    finished: {text: "已结束"}
}

export const itemStatusMap = {
    true: {text: "已通过"},
    false: {text: "未通过"}
}

export const orderStatusMap = {
    pending: {text: "待处理"},
    confirmed: {text: "已确认"},
    pushed: {text: "已下单"},
    arrived: {text: "待发货"},
    finished: {text: "已完成"},
    failed: {text: "失败"}
}

export const groupSchema = object({
    id: number(),
    qq: string().regex(/^\d+$/),
    name: string(),
    status: string()
})

export const joinSchema = object({
    userId: number(),
    groupId: number()
})

export const itemSchema = object({
    id: number(),
    groupId: number(),
    name: string(),
    url: string().url(),
    price: number(),
    weight: number().nullable().default(null),
    allowed: boolean().default(false)
})

export const orderSchema = object({
    id: number(),
    userId: number(),
    itemId: number(),
    count: number().min(1).default(1),
    status: string(),
    comment: string().nullable().default(null)
})

export type GroupData = GroupSchema & {
    status: string
}

export type JoinData = JoinSchema & {
    user: UserSchema,
    group: GroupSchema
}

export type OrderData = OrderSchema & {
    item: ItemSchema,
    user: UserSchema,
    delivery: Omit<DeliverySchema, "orders"> | null
}

export type GroupSchema = zInfer<typeof groupSchema>

export type JoinSchema = zInfer<typeof joinSchema>

export type ItemSchema = zInfer<typeof itemSchema>

export type OrderSchema = zInfer<typeof orderSchema>

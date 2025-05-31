import {number, object, string, infer as zInfer} from "zod";
import {DeliverySchema} from "@/type/delivery";
import {UserSchema} from "@/type/user";
import {ItemSchema} from "@/type/item";

export const statusMap = {
    pending: {
        text: "待处理"
    },
    confirmed: {
        text: "已确认"
    },
    pushed: {
        text: "已下单"
    },
    arrived: {
        text: "待发货"
    },
    finished: {
        text: "已完成"
    },
    failed: {
        text: "失败"
    }
}

export const orderSchema = object({
    id: number(),
    userId: number(),
    itemId: number(),
    count: number().min(1).default(1),
    status: string(),
    comment: string().nullable().default(null)
})

export type OrderData = OrderSchema & {
    item: ItemSchema,
    user: UserSchema,
    delivery: Omit<DeliverySchema, "orders"> | null
}

export type OrderSchema = zInfer<typeof orderSchema>

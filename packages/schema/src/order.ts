import {z} from "zod/v4";

export const statusMap = {
    pending: {
        text: "待处理",
    },
    pushed: {
        text: "已下单",
    },
    arrived: {
        text: "待发货",
    },
    delivered: {
        text: "已发货",
    },
    finished: {
        text: "已完成",
    },
    failed: {
        text: "失败",
    },
};

export const orderSchema = z.object({
    id: z.number(),
    userId: z.number(),
    itemId: z.number(),
    deliveryId: z.number().nullish().catch(null),
    count: z.number().min(1).default(1),
    status: z.string(),
    createdAt: z.date().default(new Date()),
    comment: z.string().nullish().catch(null),
});

export const orderData = orderSchema.pick({
    id: true,
    userId: true,
    count: true,
    comment: true,
}).extend({
    itemIds: z.number().array(),
});

export type OrderSchema = z.infer<typeof orderSchema>

export type OrderData = z.infer<typeof orderData>;

import {z} from "zod/v4";

export const statusMap = {
    pending: {
        text: "待处理",
    },
    confirmed: {
        text: "正在运输",
    },
    finished: {
        text: "已完成",
    },
    warning: {
        text: "需要关注",
    },
    failed: {
        text: "失败",
    },
};

export const shippingSchema = z.object({
    id: z.number(),
    expressNumber: z.string().nullish().catch(null),
    tax: z.number().min(0),
    fee: z.number().min(0),
    status: z.string().default("pending"),
    createdAt: z.date().default(new Date()),
    comment: z.string().nullish().catch(null),
});

export const shippingData = shippingSchema.omit({
    createdAt: true,
}).extend({
    itemId: z.number(),
    itemIds: z.number().array().min(1),
});

export type ShippingSchema = z.infer<typeof shippingSchema>;

export type ShippingData = z.infer<typeof shippingData>;

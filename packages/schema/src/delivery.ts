import React from "react";
import YtoIcon from "@repo/component/icon/yto";
import ZtoIcon from "@repo/component/icon/zto";
import JdIcon from "@repo/component/icon/jd";
import SfIcon from "@repo/component/icon/sf";
import nullable from "@repo/util/data/type";
import {userSchema} from "./user";
import {z} from "zod/v4";

export const companyMap = {
    shunfeng: {
        text: "顺丰",
        icon: React.createElement(SfIcon, null),
    },
    zhongtong: {
        text: "中通",
        icon: React.createElement(ZtoIcon, null),
    },
    jd: {
        text: "京东",
        icon: React.createElement(JdIcon, null),
    },
    yuantong: {
        text: "圆通",
        icon: React.createElement(YtoIcon, null),
    },
};

export const statusMap = {
    pending: {
        text: "待处理",
    },
    pushed: {
        text: "已推送",
    },
    waiting: {
        text: "待揽收",
    },
    confirmed: {
        text: "正在运输",
    },
    finished: {
        text: "已完成",
    },
    warning: {
        text: "异常",
    },
    failed: {
        text: "失败",
    },
};

export const deliverySchema = z.object({
    id: z.number(),
    name: z.string().regex(/^[\u4e00-\u9fa5A-Za-z0-9 ]+$/),
    phone: nullable(z.string().regex(/^1\d{10}$/)),
    company: nullable(z.string()),
    address: nullable(z.string()),
    createdAt: z.date().default(new Date()),
    status: z.string().default("pending"),
    comment: nullable(z.string()),
    expressNumber: nullable(z.string()),
    user: userSchema,
});

export const deliveryData = deliverySchema.omit({
    createdAt: true,
    expressNumber: true,
    user: true,
}).extend({
    ids: z.number().array(),
    userId: z.number(),
    orderId: z.number(),
    orderIds: z.number().array(),
    save: z.boolean().default(false),
});

export type DeliverySchema = z.infer<typeof deliverySchema>

export type DeliveryData = z.infer<typeof deliveryData>

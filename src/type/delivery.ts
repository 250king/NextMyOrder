import React from "react";
import ZtoIcon from "@/component/icon/zto";
import YtoIcon from "@/component/icon/yto";
import JdIcon from "@/component/icon/jd";
import SfIcon from "@/component/icon/sf";
import {number, object, string, infer as zInfer} from "zod";
import {GroupSchema} from "@/type/group";
import {OrderSchema} from "@/type/order";
import {UserSchema} from "@/type/user";
import {ItemSchema} from "@/type/item";

export const methodMap = {
    shunfeng: {
        text: "顺丰",
        icon: React.createElement(SfIcon, null)
    },
    zhongtong: {
        text: "中通",
        icon: React.createElement(ZtoIcon, null)
    },
    jd: {
        text: "京东",
        icon: React.createElement(JdIcon, null)
    },
    yuantong: {
        text: "圆通",
        icon: React.createElement(YtoIcon, null)
    }
};

export const statusMap = {
    pending: {
        text: "待处理"
    },
    pushed: {
        text: "已推送"
    },
    waiting: {
        text: "待揽收"
    },
    confirmed: {
        text: "正在运输"
    },
    finished: {
        text: "已完成"
    },
    warning: {
        text: "异常"
    },
    failed: {
        text: "失败"
    }
}

export const deliverySchema = object({
    id: number(),
    name: string(),
    phone: string().regex(/^1\d{10}$/),
    method: string(),
    address: string(),
    status: string().default("pending"),
    orders: number().array(),
    comment: string().nullable().default(null)
})

export type DeliveryData = Omit<DeliverySchema, "orders"> & {
    orders: OrderSchema[]
}

export type OrderData = OrderSchema & {
    item: ItemSchema & {
        group: GroupSchema
    },
    user: UserSchema
}


export type DeliverySchema = zInfer<typeof deliverySchema>;
import {z} from "zod/v4";
import nullable from "@repo/util/data/type";
import {userSchema} from "./user";

export const statusMap = {
    pending: {
        text: "待处理",
    },
    paid: {
        text: "已支付",
    },
    canceled: {
        text: "已取消",
    },
};
export const methodMap = {
    wechat: {
        text: "微信支付",
    },
    alipay: {
        text: "支付宝",
    },
    bank: {
        text: "银行转账",
    },
    cash: {
        text: "现金",
    },
};
export const currencyMap = {
    JPY: {
        text: "日元",
    },
    CNY: {
        text: "人民币",
    },
};
export const typeMap = {
    list: {
        text: "需求表",
    },
    delivery_fee: {
        text: "运单",
    },
    shipping_fee: {
        text: "国际运费",
    },
    tax: {
        text: "税费",
    },
};

export const paymentSchema = z.object({
    id: z.number(),
    userId: z.number(),
    objectId: nullable(z.number()),
    type: z.string(),
    amount: z.number(),
    baseCurrency: z.string().default("CNY"),
    exchangeRate: z.number().default(1),
    payMethod: nullable(z.string()),
    createdAt: z.date().default(new Date()),
    paidAt: nullable(z.date()),
    status: z.string(),
    comment: nullable(z.string()),
    user: userSchema,
});

export const paymentData = paymentSchema.pick({
    id: true,
    userId: true,
    objectId: true,
    type: true,
    amount: true,
    baseCurrency: true,
    exchangeRate: true,
    comment: true,
});

export type PaymentSchema = z.infer<typeof paymentSchema>

export type PaymentData = z.infer<typeof paymentData>;

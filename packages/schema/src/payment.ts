
import {z} from "zod/v4";
import nullable from "@repo/util/data/type";
﻿
export const statusMap = {
  pending: {
    text: "待处理",
  },
  paid: {
    text: "已支付",
  },
  canceled:{
    text: "已取消"
  }
}
export const currencyMap = {
  JPY: {
    text: "日元",
  },
  HKD: {
    text: "港币",
  },
  CNY: {
    text: "人民币",
  },
  USD: {
    text: "美元"
  }
}
export const typeMap = {
  list: {
    text: "需求表",
  },
  order: {
    text: "订单",
  },
  delivery: {
    text: "运单"
  }
}


export const paymentSchema = z.object({
    id: z.number(),
    userId: z.number(),
    objectId: nullable(z.number()),
    type: z.string(),
    amount: z.number(),
    baseCurrency: z.string().default("CNY"),
    exchangeRate: z.number().default(1),
    payMethod: z.string(),
    createdAt: z.date().default(new Date()),
    paidAt: nullable(z.date()),
    status: z.string(),
    comment: nullable(z.string()),
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

import {z} from "zod/v4";
import nullable from "@repo/util/data/type";

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

import { z } from "zod";
import { Delivery, DeliveryCompany as DeliveryCompanyEnum, DeliveryStatus as DeliveryStatusEnum } from "@/service/db/schema";
import { Query } from "@/type/common";
import { UserResult } from "@/type/user";
import { env } from "@/util/env";

export type DeliveryCompany = (typeof DeliveryCompanyEnum.enumValues)[number];

export type DeliveryStatus = (typeof DeliveryStatusEnum.enumValues)[number];

export type DeliveryQuery = Query<{
    company?: DeliveryCompany;
    status?: DeliveryStatus;
    userId?: number;
}>;

export type DeliveryResult = typeof Delivery.$inferSelect & {
    user: UserResult;
};

export const iconMap: Record<DeliveryCompany, string> = {
    SF: "icon-[custom--sf]",
    ZTO: "icon-[custom--zto]",
    YTO: "icon-[custom--yto]",
    JD: "icon-[custom--jd]",
    EMS: "icon-[custom--ems]",
};

export const companyMap: Record<DeliveryCompany, string> = {
    SF: "顺丰快递",
    ZTO: "中通快递",
    YTO: "圆通快递",
    JD: "京东快递",
    EMS: "中国邮政",
};

export const statusMap: Record<DeliveryStatus, string> = {
    PENDING: "待推送",
    PUSHED: "已推送",
    DELIVERED: "已发出",
    ARRIVED: "已抵达",
    CANCELED: "已取消",
};

export const colorMap: Record<DeliveryStatus, "default" | "success" | "warning" | "accent"> = {
    PENDING: "warning",
    PUSHED: "accent",
    DELIVERED: "accent",
    ARRIVED: "success",
    CANCELED: "default",
};

const baseSchema = z.object({
    deliveryId: z.int().positive(),
    company: z.enum(DeliveryCompanyEnum.enumValues).optional(),
});

const addressBookSchema = baseSchema
    .extend({
        addressId: z.int().positive(),
        recipient: z.never().optional(),
        phone: z.never().optional(),
        address: z.never().optional(),
        save: z.never().optional(),
        comment: z.never().optional(),
    })
    .strict();

const manualSchema = baseSchema
    .extend({
        addressId: z.never().optional(),
        recipient: z.string().regex(/^[A-Za-z0-9 \u4e00-\u9fff]+$/).nullable(),
        phone: z.string().regex(/^1[3-9]\d{9}$/).nullable(),
        address: z.string().regex(/^[A-Za-z0-9 \u4e00-\u9fff（）()#\-、，。,./]+$/).nullable(),
        save: z.boolean().optional(),
        comment: z.string().nullable(),
    })
    .strict();

export const deliveryDetailSchema = z.union([addressBookSchema, manualSchema]);

export const createOrderSchema = z.object({
    kuaidicom: z.string().nonempty(),
    recManName: z
        .string()
        .regex(/^[A-Za-z0-9 \u4e00-\u9fff]+$/)
        .nonempty(),
    recManPhone: z
        .string()
        .regex(/^1[3-9]\d{9}$/)
        .nonempty(),
    recManAddress: z
        .string()
        .regex(/^[A-Za-z0-9 \u4e00-\u9fff（）()#\-、，。,./]+$/)
        .nonempty(),
    sendManName: z
        .string()
        .regex(/^[A-Za-z0-9 \u4e00-\u9fff]+$/)
        .nonempty(),
    sendManPhone: z
        .string()
        .regex(/^1[3-9]\d{9}$/)
        .nonempty(),
    sendManAddress: z
        .string()
        .regex(/^[A-Za-z0-9 \u4e00-\u9fff（）()#\-、，。,./]+$/)
        .nonempty(),
    callBackUrl: z.url().default(env.KD100_CALLBACK_URL).optional(),
    cargo: z.string().default("动漫周边").optional(),
    sale: z.string().default(env.KD100_NONCE).optional(),
});

export const cancelOrderSchema = z.object({
    orderId: z.string().nonempty(),
    taskId: z.string().nonempty(),
    reason: z.string().nonempty(),
})

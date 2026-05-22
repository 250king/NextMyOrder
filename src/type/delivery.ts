import { z } from "zod";
import { delivery, deliveryCompany, deliveryStatus } from "@/service/db/schema";
import { Query } from "@/type/common";
import { UserResult } from "@/type/user";

export type DeliveryCompany = (typeof deliveryCompany.enumValues)[number]

export type DeliveryStatus = (typeof deliveryStatus.enumValues)[number]

export type DeliveryQuery = Query<{
    company?: DeliveryCompany
    status?: DeliveryStatus;
    userId?: number;
}>;

export type DeliveryResult = typeof delivery.$inferSelect & {
    user: UserResult
}

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
    CANCELED: "已取消"
}

export const colorMap: Record<DeliveryStatus, "default" | "success" | "warning" | "accent"> = {
    PENDING: "warning",
    PUSHED: "accent",
    DELIVERED: "accent",
    ARRIVED: "success",
    CANCELED: "default",
};

export const deliveryDetailSchema = z.object({
    delivery: z.int().positive(),
    addressId: z.int().positive().optional(),
    phone: z.string().regex(/^1[3-9]\d{9}$/).optional(),
    address: z.string().optional(),
    comment: z.string().optional(),
    company: z.enum(deliveryCompany.enumValues).optional(),
    save: z.boolean().optional(),
})

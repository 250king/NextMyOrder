import { z } from "zod";
import { Delivery, DeliveryCompany as DeliveryCompanyEnum, DeliveryStatus as DeliveryStatusEnum } from "@/service/db/schema";
import { Query } from "@/type/common";
import { UserResult } from "@/type/user";

export type DeliveryCompany = (typeof DeliveryCompanyEnum.enumValues)[number];
export type DeliveryStatus = (typeof DeliveryStatusEnum.enumValues)[number];

export type DeliveryQuery = Query<{
    company?: DeliveryCompany;
    status?: DeliveryStatus;
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
    PENDING: "待完善",
    PUSHED: "已推送",
    DELIVERED: "已发出",
    ARRIVED: "已抵达",
    CANCELED: "已取消",
};

export const colorMap: Record<DeliveryStatus, "default" | "success" | "warning" | "accent"> = {
    PENDING: "default",
    PUSHED: "default",
    DELIVERED: "accent",
    ARRIVED: "success",
    CANCELED: "warning",
};

export const deliveryDetailSchema = z.object({
    deliveryId: z.int().positive(),
    addressId: z.int().positive(),
    company: z.enum(DeliveryCompanyEnum.enumValues).nullable(),
});

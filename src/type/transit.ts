import { Transit, TransitStatus, TransitType } from "@/service/db/schema";

export type TransitType = (typeof TransitType.enumValues)[number]

export type TransitStatus = (typeof TransitStatus.enumValues)[number]

export type TransitResult = typeof Transit.$inferSelect

export const statusMap: Record<TransitStatus, string> = {
    PENDING: "待发出",
    DISPATCHED: "已发出",
    ARRIVED: "已抵达",
    CANCELED: "已取消"
}

export const colorMap: Record<TransitStatus, "default" | "success" | "warning" | "accent"> = {
    PENDING: "warning",
    DISPATCHED: "accent",
    ARRIVED: "success",
    CANCELED: "default",
};

export const iconMap: Record<TransitType, string> = {
    PERSONAL: "icon-[ri--suitcase-2-fill]",
    LOGISTICS: "icon-[ri--ship-2-line]",
};

export const typeMap: Record<TransitType, string> = {
    PERSONAL: "专员带货",
    LOGISTICS: "物流运输"
}

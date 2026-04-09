import { DeliveryResponseCompany, DeliveryResponseStatus } from "@/api/model";

export const iconMap: Record<DeliveryResponseCompany, string> = {
    SF: "icon-[express--sf]",
    ZTO: "icon-[express--zto]",
    YTO: "icon-[express--yto]",
    JD: "icon-[express--jd]"
};

export const companyMap: Record<DeliveryResponseCompany, string> = {
    SF: "顺丰",
    ZTO: "中通",
    YTO: "圆通",
    JD: "京东"
};

export const statusMap: Record<DeliveryResponseStatus, string> = {
    PENDING: "待推送",
    PUSHED: "已推送",
    DELIVERED: "已发出",
    ARRIVED: "已抵达",
    CANCELED: "已取消"
}

export const colorMap: Record<DeliveryResponseStatus, "default" | "success" | "warning" | "accent"> = {
    PENDING: "warning",
    PUSHED: "accent",
    DELIVERED: "accent",
    ARRIVED: "success",
    CANCELED: "default",
};

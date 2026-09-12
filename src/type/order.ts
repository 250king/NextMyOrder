import { Order, OrderStatus } from "@/service/db/schema";
import { ItemResult } from "@/type/item";
import { TransitResult } from "@/type/transit";
import { UserResult } from "@/type/user";

export type OrderStatus = (typeof OrderStatus.enumValues)[number];

export const statusMap: Record<OrderStatus, string> = {
    PENDING: "待处理",
    CONFIRMED: "已确认",
    PURCHASED: "已下单",
    TRANSITING: "已发货",
    ARRIVED: "已抵达仓库",
    DELIVERING: "已发出",
    COMPLETED: "已完成",
    CANCELED: "已取消",
};

export const colorMap: Record<OrderStatus, "default" | "success" | "warning" | "accent"> = {
    PENDING: "default",
    CONFIRMED: "accent",
    PURCHASED: "default",
    TRANSITING: "default",
    ARRIVED: "accent",
    DELIVERING: "accent",
    COMPLETED: "success",
    CANCELED: "warning",
};

export type OrderWithItemResult = typeof Order.$inferSelect & {
    item: ItemResult;
};

export type OrderResult = OrderWithItemResult & {
    user: UserResult;
    transit: TransitResult | null;
};

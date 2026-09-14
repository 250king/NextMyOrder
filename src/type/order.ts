import { Order, OrderStatus } from "@/service/db/schema";
import { Query } from "@/type/common";
import { TransitResult } from "@/type/transit";
import { UserResult } from "@/type/user";

export type OrderStatus = (typeof OrderStatus.enumValues)[number];

export const statusMap: Record<OrderStatus, string> = {
    PENDING: "待处理",
    PURCHASED: "已下单",
    TRANSITING: "已发货",
    ARRIVED: "已抵达仓库",
    DELIVERING: "已发出",
    COMPLETED: "已完成",
    CANCELED: "已取消",
};

export const colorMap: Record<OrderStatus, "default" | "success" | "warning" | "accent"> = {
    PENDING: "default",
    PURCHASED: "default",
    TRANSITING: "default",
    ARRIVED: "accent",
    DELIVERING: "accent",
    COMPLETED: "success",
    CANCELED: "warning",
};

export type OrderSnapshotResult = typeof Order.$inferSelect;

export type OrderQuery = Query<{
    status?: OrderStatus;
}>;

export type OrderResult = OrderSnapshotResult & {
    user: UserResult;
    transit: TransitResult | null;
};

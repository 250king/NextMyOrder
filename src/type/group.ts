import { group, groupStatus } from "@/service/db/schema";
import { Query } from "@/type/common";

export type GroupStatus = (typeof groupStatus.enumValues)[number]

export type GroupResult = typeof group.$inferSelect

export type GroupQuery = Query<{
    userId: number,
    status: GroupStatus
}>

export const statusMap: Record<GroupStatus, string> = {
    PENDING: "开放中",
    CLOSED: "已截止",
    COMPLETED: "已结束"
}

export const colorMap: Record<GroupStatus, "default" | "success" | "warning"> = {
    PENDING: "success",
    CLOSED: "warning",
    COMPLETED: "default",
};

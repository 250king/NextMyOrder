import { GroupResponseStatus } from "@/api/model";

export const statusMap: Record<GroupResponseStatus, string> = {
    OPENING: "开放中",
    CLOSED: "已截止",
    FINISHED: "已结束"
}

export const colorMap: Record<GroupResponseStatus, "default" | "success" | "warning"> = {
    OPENING: "success",
    CLOSED: "warning",
    FINISHED: "default"
}

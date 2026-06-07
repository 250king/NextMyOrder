import { z } from "zod";
import { Group, GroupStatus as GroupStatusEnum } from "@/service/db/schema";
import { Query } from "@/type/common";

export type GroupStatus = (typeof GroupStatusEnum.enumValues)[number]

export type GroupResult = typeof Group.$inferSelect

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

export const groupCreateSchema = z.object({
    name: z.string().nonempty(),
    qq: z
        .string()
        .regex(/^\d{5,}$/)
        .nonempty(),
    image: z.url().nullable(),
    deadline: z.date().nonoptional(),
});

export const groupDetailSchema = groupCreateSchema.extend({
    id: z.number().positive().nonoptional(),
}).strict()

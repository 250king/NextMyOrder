"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/service/db";
import { Group } from "@/service/db/schema";
import { groupCreateSchema, groupDetailSchema } from "@/type/group";
import { getContext } from "@/util/context";

export const createGroup = async (params: z.infer<typeof groupCreateSchema>) => {
    const context = await getContext();
    if (!context.isAdmin) {
        throw new Error("非管理员无权限");
    }
    const { name, qq, deadline, image } = groupCreateSchema.parse(params);
    await db.insert(Group).values({ name, qq, deadline, image });
}

export const saveGroup = async (params: z.infer<typeof groupDetailSchema>) => {
    const context = await getContext();
    if (!context.isAdmin) {
        throw new Error("非管理员无权限");
    }
    const { id, name, qq, deadline, image } = groupDetailSchema.parse(params);
    const data = await db.query.Group.findFirst({
        where: eq(Group.id, id),
    });
    if (!data) {
        throw new Error("团购不存在");
    }
    if (data.status === "COMPLETED") {
        throw new Error("当前状态无法修改");
    }
    await db.update(Group).set({ name, qq, deadline, image }).where(eq(Group.id, id));
};

export const changeGroupLock = async (params: number) => {
    const context = await getContext();
    if (!context.isAdmin) {
        throw new Error("非管理员无权限");
    }
    const id = z.int().positive().parse(params);
    const data = await db.query.Group.findFirst({
        where: eq(Group.id, id),
    });
    if (!data) {
        throw new Error("团购不存在");
    }
    if (data.status === "COMPLETED") {
        throw new Error("当前状态无法修改");
    }
    await db
        .update(Group)
        .set({ status: data.status === "PENDING" ? "CLOSED" : "PENDING" })
        .where(eq(Group.id, id));
};

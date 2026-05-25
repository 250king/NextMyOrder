"use server";

import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/service/db";
import { group } from "@/service/db/schema";
import { groupDetailSchema } from "@/type/group";
import { getContext } from "@/util/context";

export const saveGroup = async (data: z.infer<typeof groupDetailSchema>) => {
    const context = await getContext();
    if (!context.isAdmin) {
        throw new Error("非管理员无权限");
    }
    const { id, name, qq, deadline, image } = groupDetailSchema.parse(data);
    const result = await db.query.group.findFirst({
        where: eq(group.id, id),
    });
    if (!result) {
        notFound();
    }
    if (result.status === "COMPLETED") {
        throw Error("当前状态无法修改");
    }
    await db.update(group).set({ name, qq, deadline, image }).where(eq(group.id, id));
};

export const changeGroupLock = async (data: number) => {
    const context = await getContext();
    if (!context.isAdmin) {
        throw new Error("非管理员无权限");
    }
    const id = z.int().positive().parse(data);
    const result = await db.query.group.findFirst({
        where: eq(group.id, id),
    });
    if (!result) {
        notFound();
    }
    if (result.status === "COMPLETED") {
        throw Error("当前状态无法修改");
    }
    await db
        .update(group)
        .set({ status: result.status === "PENDING" ? "CLOSED" : "PENDING" })
        .where(eq(group.id, id));
};

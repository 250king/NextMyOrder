"use server";

import { and, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/service/db";
import { Group, Item, List, Member, Order } from "@/service/db/schema";
import { groupCreateSchema, groupDetailSchema } from "@/type/group";
import { getContext } from "@/util/context";

export const createGroup = async (params: z.infer<typeof groupCreateSchema>) => {
    const context = await getContext();
    if (!context.isAdmin) {
        throw new Error("非管理员无权限");
    }
    const { name, qq, deadline, image } = groupCreateSchema.parse(params);
    await db.insert(Group).values({ name, qq, deadline, image });
};

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

    if (data.status === "CLOSED") {
        const finalized = await db.query.Member.findFirst({
            where: and(eq(Member.groupId, id), isNotNull(Member.finalizedAt)),
        });
        if (finalized) {
            throw new Error("已有成员生成订单，无法重新开放团购");
        }
    }

    await db
        .update(Group)
        .set({ status: data.status === "PENDING" ? "CLOSED" : "PENDING" })
        .where(eq(Group.id, id));
};

export const finalizeGroupList = async (params: number) => {
    const context = await getContext();
    const groupId = z.int().positive().parse(params);

    await db.transaction(async (tx) => {
        const [member] = await tx
            .select({
                userId: Member.userId,
                finalizedAt: Member.finalizedAt,
                groupStatus: Group.status,
            })
            .from(Member)
            .innerJoin(Group, eq(Group.id, Member.groupId))
            .where(and(eq(Member.userId, context.uid!), eq(Member.groupId, groupId)))
            .for("update");

        if (!member) {
            throw new Error("团购不存在");
        }
        if (member.groupStatus !== "CLOSED") {
            throw new Error("当前团购尚未进入确认阶段");
        }
        if (member.finalizedAt) {
            return;
        }

        const existed = await tx
            .select({ id: Order.id })
            .from(Order)
            .innerJoin(Item, eq(Item.id, Order.itemId))
            .where(and(eq(Order.userId, context.uid!), eq(Item.groupId, groupId)))
            .limit(1);

        if (existed.length > 0) {
            throw new Error("检测到已存在订单，请联系管理员处理");
        }

        const listItems = await tx
            .select({
                itemId: List.itemId,
                count: List.count,
            })
            .from(List)
            .innerJoin(Item, eq(Item.id, List.itemId))
            .where(and(eq(List.userId, context.uid!), eq(Item.groupId, groupId)));

        if (listItems.length > 0) {
            await tx.insert(Order).values(
                listItems.map((item) => ({
                    userId: context.uid!,
                    itemId: item.itemId,
                    count: item.count,
                    status: "CONFIRMED" as const,
                }))
            );
        }

        await tx
            .update(Member)
            .set({ finalizedAt: new Date() })
            .where(and(eq(Member.userId, context.uid!), eq(Member.groupId, groupId)));
    });
};

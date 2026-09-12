"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/service/db";
import { Group, Item, List, Member, Order } from "@/service/db/schema";
import { getContext } from "@/util/context";

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
            throw new Error("检测到已存在订单，请刷新页面后重试");
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

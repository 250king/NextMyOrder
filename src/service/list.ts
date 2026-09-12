"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/service/db";
import { Group, Item, List, Member } from "@/service/db/schema";
import { changeListCountSchema } from "@/type/list";
import { getContext } from "@/util/context";

export const changeListCount = async (params: z.input<typeof changeListCountSchema>) => {
    const context = await getContext();
    const { itemId, count } = changeListCountSchema.parse(params);

    await db.transaction(async (tx) => {
        const [item] = await tx
            .select({
                id: Item.id,
                groupStatus: Group.status,
            })
            .from(Item)
            .innerJoin(Group, eq(Group.id, Item.groupId))
            .innerJoin(Member, and(eq(Member.groupId, Group.id), eq(Member.userId, context.uid!)))
            .where(eq(Item.id, itemId))
            .for("update", { of: Group });

        if (!item) {
            throw new Error("商品不存在");
        }
        if (item.groupStatus !== "PENDING") {
            throw new Error("当前团购已截止，无法修改需求");
        }

        if (count === 0) {
            await tx
                .delete(List)
                .where(and(eq(List.userId, context.uid!), eq(List.itemId, item.id)));
            return;
        }

        await tx
            .insert(List)
            .values({
                userId: context.uid!,
                itemId: item.id,
                count,
            })
            .onConflictDoUpdate({
                target: [List.userId, List.itemId],
                set: { count },
            });
    });
};

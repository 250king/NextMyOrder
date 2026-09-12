"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/service/db";
import { Demand, Group, Item, Member } from "@/service/db/schema";
import { changeDemandCountSchema } from "@/type/demand";
import { getContext } from "@/util/context";

export const changeDemandCount = async (params: z.input<typeof changeDemandCountSchema>) => {
    const context = await getContext();
    const { itemId, count } = changeDemandCountSchema.parse(params);

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
                .delete(Demand)
                .where(and(eq(Demand.userId, context.uid!), eq(Demand.itemId, item.id)));
            return;
        }

        await tx
            .insert(Demand)
            .values({
                userId: context.uid!,
                itemId: item.id,
                count,
            })
            .onConflictDoUpdate({
                target: [Demand.userId, Demand.itemId],
                set: { count },
            });
    });
};

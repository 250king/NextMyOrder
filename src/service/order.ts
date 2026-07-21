"use server"

import { and, eq, notExists, SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/service/db";
import { DeliveryToOrder, Group, Item, List, Order } from "@/service/db/schema";
import { changeCountSchema, orderQuery } from "@/type/order";
import { getContext } from "@/util/context";
import { toPagination } from "@/util/cover";

export const getOrders = async (params: z.input<typeof orderQuery>) => {
    const context = await getContext();
    if (!context.isAdmin) {
        throw new Error("非管理员无权限");
    }
    const { userId, notInDelivery, ...extend } = orderQuery.parse(params);
    const pagination = toPagination(extend);
    const filters: SQL[] = [
        eq(Order.status, "ARRIVED"),
    ];
    if (userId) {
        filters.push(eq(Order.userId, userId));
    }
    if (notInDelivery) {
        filters.push(
            notExists(
                db
                    .select({ id: DeliveryToOrder.orderId })
                    .from(DeliveryToOrder)
                    .where(and(eq(DeliveryToOrder.orderId, Order.id), eq(DeliveryToOrder.deliveryId, notInDelivery)))
            )
        );
    }
    const [items, count] = await Promise.all([
        db.query.Order.findMany({
            where: and(...filters),
            with: {
                user: true,
                transit: true,
                item: {
                    with: {
                        group: true,
                    },
                },
            },
            ...pagination,
        }),
        db.$count(Order, and(...filters)),
    ]);
    return {
        items,
        count,
    };
};

export const changeCount = async (params: z.input<typeof changeCountSchema>) => {
    const context = await getContext();
    const { itemId, count } = changeCountSchema.parse(params);
    await db.transaction(async (tx) => {
        const [item] = await tx
            .select({
                id: Item.id,
                groupStatus: Group.status,
            })
            .from(Item)
            .innerJoin(Group, eq(Group.id, Item.groupId))
            .innerJoin(List, and(eq(List.groupId, Group.id), eq(List.userId, context.uid!)))
            .where(eq(Item.id, itemId))
            .for("update", { of: Group });

        if (!item) {
            throw new Error("商品不存在");
        }
        if (item.groupStatus !== "PENDING") {
            throw new Error("当前团购已截止，无法修改数量");
        }
        if (count === 0) {
            await tx.delete(Order).where(and(eq(Order.userId, context.uid!), eq(Order.itemId, item.id)));
            return;
        }
        await tx
            .insert(Order)
            .values({
                userId: context.uid!,
                itemId: item.id,
                count,
            })
            .onConflictDoUpdate({
                target: [Order.userId, Order.itemId],
                set: { count },
            });
    });
}

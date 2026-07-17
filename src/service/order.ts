"use server"

import { and, eq, notExists, SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/service/db";
import { DeliveryToOrder, Order } from "@/service/db/schema";
import { orderQuery } from "@/type/order";
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

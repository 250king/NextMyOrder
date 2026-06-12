"use server"

import { and, eq, SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/service/db";
import { Order } from "@/service/db/schema";
import { orderQuery } from "@/type/order";
import { getContext } from "@/util/context";
import { toPagination } from "@/util/cover";

export const getOrders = async (params: z.input<typeof orderQuery>) => {
    const context = await getContext();
    if (!context.isAdmin) {
        throw new Error("非管理员无权限");
    }
    const { userId, ...extend } = orderQuery.parse(params);
    const pagination = toPagination(extend);
    const filters: SQL[] = [
        eq(Order.status, "ARRIVED"),
    ];
    if (userId) {
        filters.push(eq(Order.userId, userId));
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

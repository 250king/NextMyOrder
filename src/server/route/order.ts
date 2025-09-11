import {queryDsl, SafeRule, whereBuilder} from "@/util/query";
import {procedure} from "@/server/server";
import {orderSchema} from "@/type/order";
import {TRPCError} from "@trpc/server";
import {z} from "zod/v4";

const orderRouter = {
    orderGetAll: procedure.input(queryDsl).query(async ({ctx, input}) => {
        const rule: SafeRule = {
            filter: [
                {
                    field: "id",
                    operator: ["eq"],
                },
                {
                    field: "userId",
                    operator: ["eq"],
                },
                {
                    field: "itemId",
                    operator: ["eq"],
                },
                {
                    field: "groupId",
                    operator: ["eq"],
                },
                {
                    field: "status",
                    operator: ["eq"],
                },
            ],
            sort: ["id", "userId", "name", "count", "status", "createdAt"],
        };
        const [data, total] = await Promise.all([
            ctx.db.order.findMany(whereBuilder(input, rule)),
            ctx.db.order.count(whereBuilder(input, rule, true)),
        ]);
        return {
            items: data,
            total: total,
        };
    }),

    userSummary: procedure.input(queryDsl).query(async ({ctx, input}) => {
        const rule : SafeRule = {
            filter: [
                {
                    field: "id",
                    operator: ["eq"],
                },
                {
                    field: "groupId",
                    operator: ["eq"],
                },
            ],
            sort: ["id", "qq", "total"],
            search: ["name", "qq"],
        };
        const [data, total] = await Promise.all([
            ctx.db.userSummary.findMany(whereBuilder(input, rule)),
            ctx.db.userSummary.count(whereBuilder(input, rule, true)),
        ]);
        return {
            items: data,
            total: total,
        };
    }),

    taxSummary: procedure.input(queryDsl).query(async ({ctx, input}) => {
        const rule : SafeRule = {
            filter: [
                {
                    field: "id",
                    operator: ["eq"],
                },
                {
                    field: "shippingId",
                    operator: ["eq"],
                },
            ],
            sort: ["id", "name", "total"],
            search: ["name", "qq"],
        };
        const [data, total] = await Promise.all([
            ctx.db.taxSummary.findMany(whereBuilder(input, rule)),
            ctx.db.taxSummary.count(whereBuilder(input, rule, true)),
        ]);
        return {
            items: data,
            total: total,
        };
    }),

    weightSummary: procedure.input(queryDsl).query(async ({ctx, input}) => {
        const rule : SafeRule = {
            filter: [
                {
                    field: "id",
                    operator: ["eq"],
                },
                {
                    field: "shippingId",
                    operator: ["eq"],
                },
            ],
            sort: ["id", "name", "total"],
            search: ["name", "qq"],
        };
        const [data, total] = await Promise.all([
            ctx.db.weightSummary.findMany(whereBuilder(input, rule)),
            ctx.db.weightSummary.count(whereBuilder(input, rule, true)),
        ]);
        return {
            items: data,
            total: total,
        };
    }),

    orderCreateAll: procedure.input(orderSchema.pick({
        userId: true,
        count: true,
        comment: true,
    }).extend({
        itemIds: z.number().array(),
    })).mutation(async ({ctx, input}) => {
        let result = 0;
        for (const i of input.itemIds) {
            if (await ctx.db.order.findFirst({
                where: {
                    userId: input.userId,
                    itemId: i,
                },
            })) {
                continue;
            }
            if (!await ctx.db.item.findUnique({
                where: {
                    id: i,
                    allowed: true,
                },
            })) {
                continue;
            }
            await ctx.db.order.create({
                data: {
                    userId: input.userId,
                    itemId: i,
                    count: input.count,
                },
            });
            result++;
        }
        if (result !== 0) {
            await ctx.db.list.updateMany({
                where: {
                    userId: input.userId,
                    group: {
                        items: {
                            some: {
                                id: {
                                    in: input.itemIds,
                                },
                            },
                        },
                    },
                },
                data: {
                    confirmed: false,
                },
            });
        }
        return {
            total: result,
        };
    }),

    orderUpdate: procedure.input(orderSchema.pick({
        id: true,
        count: true,
        comment: true,
    })).mutation(async ({ctx, input}) => {
        const {id, ...data} = input;
        const order = await ctx.db.order.findUnique({
            where: {
                id: id,
            },
            include: {
                item: true,
            },
        });
        if (!order) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "订单不存在",
            });
        }
        if (order.count !== data.count) {
            if (order.status === "pushed" || order.status === "delivered") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "订单状态不允许修改",
                });
            }
            if (order.status === "pending") {
                await ctx.db.list.update({
                    where: {
                        userId_groupId: {
                            userId: order.userId,
                            groupId: order.item.groupId,
                        },
                    },
                    data: {
                        confirmed: false,
                    },
                });
            }
        }
        return await ctx.db.order.update({
            where: {
                id: id,
            },
            data: {
                ...data,
            },
        });
    }),

    orderDelete: procedure.input(orderSchema.pick({
        id: true,
    })).mutation(async ({ctx, input}) => {
        const order = await ctx.db.order.findUnique({
            where: {
                id: input.id,
            },
            include: {
                item: true,
            },
        });
        if (!order) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "订单不存在",
            });
        }
        if (order.status !== "pending") {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "订单状态不允许删除",
            });
        }
        await ctx.db.list.update({
            where: {
                userId_groupId: {
                    userId: order.userId,
                    groupId: order.item.groupId,
                },
            },
            data: {
                confirmed: false,
            },
        });
        await ctx.db.order.delete({
            where: {
                id: input.id,
            },
        });
    }),
};

export default orderRouter;

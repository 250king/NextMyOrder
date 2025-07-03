import {publicProcedure, router} from "@/server/loader";
import {queryParams, queryParser} from "@/util/query";
import {orderSchema, statusMap} from "@/type/order";
import {TRPCError} from "@trpc/server";
import {number} from "zod";

const flow = {
    failed: ["pushed", "confirmed"],
    finished: ["arrived"],
    confirmed: ["pending"],
    arrived: ["pushed"],
    pending: [],
    pushed: []
};

const orderRouter = router({
    get: publicProcedure.input(queryParams).query(async ({ctx, input}) => {
        const query = queryParser(input, []);
        return {
            items: await ctx.database.order.findMany({
                ...query,
                include: {
                    user: true,
                    delivery: true,
                    item: {
                        include: {
                            group: true,
                        }
                    }
                }
            }),
            total: await ctx.database.order.count({where: query.where})
        };
    }),

    create: publicProcedure.input(orderSchema.pick({
        count: true,
        comment: true,
        userId: true
    }).extend({
        itemIds: number().array()
    })).mutation(async ({ctx, input}) => {
        const {itemIds, ...data} = input;
        return await ctx.database.order.createMany({
            data: itemIds.map(itemId => ({
                ...data,
                itemId: itemId,
                userId: input.userId,
                status: "pending"
            }))
        });
    }),

    update: publicProcedure.input(orderSchema.omit({
        userId: true,
        itemId: true,
        status: true
    })).mutation(async ({ctx, input}) => {
        const {id, ...data} = input;
        if (!await ctx.database.order.findUnique({
            where: {
                id: id,
                status: "pending"
            }
        })) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "该订单已确认不允许修改"
            });
        }
        return await ctx.database.order.update({
            data: data,
            where: {
                id: id
            }
        });
    }),

    delete: publicProcedure.input(orderSchema.pick({
        id: true
    })).mutation(async ({ctx, input}) => {
        if (!await ctx.database.order.findUnique({
            where: {
                id: input.id,
                status: "pending"
            }
        })) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "该订单已确认不允许取消"
            });
        }
        await ctx.database.order.delete({
            where: {
                id: input.id
            }
        });
    }),

    flow: publicProcedure.input(orderSchema.pick({
        status: true
    }).extend({
        ids: number().array().optional(),
        userIds: number().array().optional()
    })).mutation(async ({ctx, input}) => {
        if (input.ids?.length !== 0) {
            await ctx.database.order.updateMany({
                where: {
                    id: {
                        in: input.ids
                    },
                    status: {
                        in: flow[input.status as keyof typeof statusMap],
                    }
                },
                data: {
                    status: input.status
                }
            })
        }
        else if (input.userIds?.length !== 0) {
            await ctx.database.order.updateMany({
                where: {
                    userId: {
                        in: input.userIds
                    },
                    status: {
                        in: flow[input.status as keyof typeof statusMap],
                    }
                },
                data: {
                    status: input.status
                }
            })
        }
        else {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "请至少提供一个订单ID或用户ID"
            });
        }
    }),

    push: publicProcedure.input(orderSchema.pick({
        itemId: true,
        count: true
    })).mutation(async ({ctx, input}) => {
        const items = await ctx.database.order.findMany({
            where: {
                status: "confirmed",
                item: {
                    id: input.itemId,
                    group: {
                        status: {
                            not: "finished"
                        }
                    }
                }
            },
            take: input.count
        })
        await ctx.database.order.updateMany({
            where: {
                id: {
                    in: items.map(i => i.id)
                }
            },
            data: {
                status: "pushed"
            }
        })
    })
});

export default orderRouter;

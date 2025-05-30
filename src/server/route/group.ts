import {publicProcedure, router} from "@/server/loader";
import {queryParams, queryParser} from "@/util/query";
import {groupSchema, joinSchema} from "@/type/group";
import {TRPCError} from "@trpc/server";
import {number, object} from "zod";

const user = router({
    get: publicProcedure.input(object({
        groupId: number(),
        ...queryParams.shape
    })).query(async ({ctx, input}) => {
        const query = queryParser(input, [
            "user.name",
            "user.qq",
            "user.email"
        ], {
            groupId: input.groupId
        });
        return {
            items: await ctx.database.join.findMany({
                ...query,
                include: {
                    user: true
                }
            }),
            total: await ctx.database.join.count({
                where: query.where
            })
        }
    }),

    add: publicProcedure.input(joinSchema).mutation(async ({ctx, input}) => {
        return await ctx.database.join.create({
            data: {
                userId: input.userId,
                groupId: input.groupId
            }
        });
    }),

    delete: publicProcedure.input(joinSchema.pick({
        groupId: true,
        userId: true
    })).mutation(async ({ctx, input}) => {
        if (await ctx.database.order.count({
            where: {
                item: {
                    groupId: input.groupId
                },
                userId: input.userId,
                status: {
                    not: "failed"
                }
            }
        }) != 0) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "该用户存在订单且在正常状态不得移除"
            })
        }
        await ctx.database.join.delete({
            where: {
                userId_groupId: {
                    userId: input.userId,
                    groupId: input.groupId
                }
            }
        });
    })
});

const groupRouter = router({
    get: publicProcedure.input(queryParams).query(async ({ctx, input}) => {
        const query = queryParser(input, ["qq", "name"])
        return {
            items: await ctx.database.group.findMany(query),
            total: await ctx.database.group.count({
                where: query.where
            })
        };
    }),

    create: publicProcedure.input(groupSchema.omit({
        id: true,
        status: true
    })).mutation(async ({ctx, input}) => {
        return await ctx.database.group.create({
            data: {
                ...input,
                status: "activated"
            }
        });
    }),

    update: publicProcedure.input(groupSchema).mutation(async ({ctx, input}) => {
        const {id, ...data} = input;
        return await ctx.database.group.update({
            data: data,
            where: {
                id: id
            }
        });
    }),

    delete: publicProcedure.input(groupSchema.pick({
        id: true
    })).mutation(async ({ctx, input}) => {
        if (await ctx.database.join.count({
            where: {
                groupId: input.id
            }
        }) != 0) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "该群组存在用户不得删除"
            });
        }
        await ctx.database.group.delete({
            where: {
                id: input.id
            }
        });
    }),

    flow: publicProcedure.input(groupSchema.pick({
        id: true,
    })).mutation(async ({ctx, input}) => {
        await ctx.database.group.update({
            where: {
                id: input.id,
                status: "activated"
            },
            data: {
                status: "stopped",
            }
        });
    }),

    user
});

export default groupRouter;

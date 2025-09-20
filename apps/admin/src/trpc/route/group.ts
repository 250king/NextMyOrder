import napcat from "@repo/util/client/napcat";
import {queryDsl, SafeRule, whereBuilder} from "@repo/util/data/query";
import {groupData} from "@repo/schema/group";
import {procedure} from "@/trpc/server";
import {TRPCError} from "@trpc/server";

const groupRouter = {
    groupGetNick: procedure.input(groupData.pick({
        qq: true,
    })).query(async ({input}) => {
        const res = await napcat.post(`/get_group_info`, {
            group_id: input.qq,
        });
        if (!res.data.data.groupName) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "无法自动获得昵称",
            });
        }
        return {
            name: res.data.data.groupName,
        };
    }),

    groupGetById: procedure.input(groupData.pick({
        id: true,
    })).query(async ({ctx, input}) => {
        const group = await ctx.db.group.findUnique({
            where: {
                id: input.id,
            },
        });
        if (!group) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "团购不存在",
            });
        }
        return group;
    }),

    groupGetAll: procedure.input(queryDsl).query(async ({ctx, input}) => {
        const rule: SafeRule = {
            filter: [
                {field: "id", operator: ["eq"]},
                {field: "ended", operator: ["eq"]},
                {field: "items.some.orders.some.shippingId", operator: ["eq"]},
                {field: "items.some.orders.some.userId", operator: ["eq"]},
            ],
            sort: ["id", "name", "createdAt", "deadline", "ended"],
            search: ["name", "qq"],
        };
        const [data, total] = await Promise.all([
            ctx.db.group.findMany(whereBuilder(input, rule)),
            ctx.db.group.count(whereBuilder(input, rule, true)),
        ]);
        return {
            items: data,
            total: total,
        };
    }),

    groupCreate: procedure.input(groupData.omit({
        id: true,
    })).mutation(async ({ctx, input}) => {
        if (await ctx.db.group.findUnique({
            where: {
                qq: input.qq,
            },
        })) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "该用户已存在",
            });
        }
        return await ctx.db.group.create({
            data: input,
        });
    }),

    groupUpdate: procedure.input(groupData).mutation(async ({ctx, input}) => {
        const {id, ...data} = input;
        if (!await ctx.db.group.findUnique({
            where: {
                id: id,
            },
        })) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "用户不存在",
            });
        }
        return await ctx.db.group.update({
            where: {
                id: id,
            },
            data: data,
        });
    }),

    groupDelete: procedure.input(groupData.pick({
        id: true,
    })).mutation(async ({ctx, input}) => {
        const group = await ctx.db.group.findUnique({
            where: {
                id: input.id,
            },
        });
        if (!group) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "团购不存在",
            });
        }
        if (!group.ended) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "团购未完成，无法删除",
            });
        }
        await ctx.db.group.delete({
            where: {
                id: input.id,
            },
        });
    }),
};

export default groupRouter;

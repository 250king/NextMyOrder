import napcat from "@repo/util/client/napcat";
import {queryDsl, SafeRule, whereBuilder} from "@repo/util/data/query";
import {userData} from "@repo/schema/user";
import {procedure} from "@/trpc/server";
import {TRPCError} from "@trpc/server";

const userRouter = {
    userGetNick: procedure.input(userData.pick({
        qq: true,
    })).query(async ({input}) => {
        const res = await napcat.post(`/get_stranger_info`, {
            user_id: input.qq,
        });
        if (!res.data.data.nick) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "无法自动获得昵称",
            });
        }
        return {
            name: res.data.data.nick,
        };
    }),

    userGetById: procedure.input(userData.pick({
        id: true,
    })).query(async ({ctx, input}) => {
        const user = await ctx.db.user.findUnique({
            where: {
                id: input.id,
            },
        });
        if (!user) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "用户不存在",
            });
        }
        return user;
    }),

    userGetAll: procedure.input(queryDsl).query(async ({ctx, input}) => {
        const rule: SafeRule = {
            filter: [
                {field: "id", operator: ["eq"]},
                {field: "lists.none.groupId", operator: ["eq"]},
                {field: "lists.some.group.ended", operator: ["eq"]},
                {field: "orders.some.shippingId", operator: ["eq"]},
                {field: "orders.some.status", operator: ["eq"]},
            ],
            column: {
                modal: "User",
                block: ["address", "phone"],
            },
            sort: ["id", "qq", "email", "createdAt"],
            search: ["name", "qq", "email"],
        };
        const [data, total] = await Promise.all([
            ctx.db.user.findMany(whereBuilder(input, rule)),
            ctx.db.user.count(whereBuilder(input, rule, true)),
        ]);
        return {
            items: data,
            total: total,
        };
    }),

    userCreate: procedure.input(userData.omit({
        id: true,
        qqs: true,
    })).mutation(async ({ctx, input}) => {
        if (await ctx.db.user.findUnique({
            where: {
                qq: input.qq,
            },
        })) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "该用户已存在",
            });
        }
        return await ctx.db.user.create({
            data: input,
        });
    }),

    userCreateAll: procedure.input(userData.pick({
        qqs: true,
    })).mutation(async ({ctx, input}) => {
        const result = [];
        for (const qq of input.qqs) {
            if (await ctx.db.user.findUnique({
                where: {
                    qq: qq.toString(),
                },
            })) {
                continue;
            }
            const res = await napcat.post(`/get_stranger_info`, {
                user_id: qq,
            });
            if (!res.data.data.nick) {
                continue;
            }
            result.push(await ctx.db.user.create({
                data: {
                    qq: qq.toString(),
                    name: res.data.data.nick,
                },
            }));
        }
        return {
            items: result,
            total: result.length,
        };
    }),

    userUpdate: procedure.input(userData.omit({
        qqs: true,
    })).mutation(async ({ctx, input}) => {
        const {id, ...data} = input;
        if (!await ctx.db.user.findUnique({
            where: {
                id: id,
            },
        })) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "用户不存在",
            });
        }
        return await ctx.db.user.update({
            where: {
                id: id,
            },
            data: data,
        });
    }),

    userDelete: procedure.input(userData.pick({
        id: true,
    })).mutation(async ({ctx, input}) => {
        if (!await ctx.db.user.findUnique({
            where: {
                id: input.id,
            },
        })) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "用户不存在",
            });
        }
        if (await ctx.db.list.count({
            where: {
                userId: input.id,
            },
        }) != 0) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "用户仍有需求单存在，无法删除",
            });
        }
        await ctx.db.user.delete({
            where: {
                id: input.id,
            },
        });
    }),
};

export default userRouter;

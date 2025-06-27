import common from "@/util/client/common";
import {publicProcedure, router} from "@/server/loader";
import {queryParams, queryParser} from "@/util/query";
import {TRPCError} from "@trpc/server";
import {userSchema} from "@/type/user";
import {object, string} from "zod";

const userRouter = router({
    get: publicProcedure.input(queryParams).query(async ({ctx, input}) => {
        const query = queryParser(input, [
            "qq",
            "name",
            "email"
        ])
        return {
            items: await ctx.database.user.findMany(query),
            total: await ctx.database.user.count({
                where: query.where
            })
        };
    }),

    getName: publicProcedure.input(object({
        qq: string().regex(/^\d+$/)
    })).query(async ({input}) => {
        const res = await common.get("https://jkapi.com/api/qqinfo", {
            params: {
                qq: input.qq
            }
        })
        if (!res.data.nick) {
            throw new TRPCError({code: "NOT_FOUND"})
        }
        return {name: res.data.nick};
    }),

    add: publicProcedure.input(userSchema.omit({
        id: true
    })).mutation(async ({ctx, input}) => {
        return await ctx.database.user.create({data: input});
    }),

    update: publicProcedure.input(userSchema).mutation(async ({ctx, input}) => {
        const {id, ...data} = input;
        return await ctx.database.user.update({data: data, where: {id: id}});
    }),

    delete: publicProcedure.input(userSchema.pick({
        id: true
    })).mutation(async ({ctx, input}) => {
        if (await ctx.database.order.count({
            where: {
                userId: input.id,
                status: {
                    not: "failed"
                }
            }
        }) != 0) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "该用户存在订单且在正常状态不得删除"
            })
        }
        await ctx.database.user.delete({where: {id: input.id}});
    })
})

export default userRouter;

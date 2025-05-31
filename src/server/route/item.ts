import parseItem from "@/util/item";
import {publicProcedure, router} from "@/server/loader";
import {queryParams, queryParser} from "@/util/query";
import {itemSchema} from "@/type/item";
import {TRPCError} from "@trpc/server";
import {object, string} from "zod";

const itemRouter = router({
    getInfo: publicProcedure.input(object({
        url: string().url()
    })).query(async ({input}) => {
        const result = await parseItem(input.url);
        if (!result) {
            throw new TRPCError({
                code: "NOT_FOUND"
            });
        }
        return result;
    }),

    get: publicProcedure.input(queryParams).query(async ({ctx, input}) => {
        const query = queryParser(input, ["name"]);
        return {
            items: await ctx.database.item.findMany(query),
            total: await ctx.database.item.count({
                where: query.where
            })
        };
    }),

    create: publicProcedure.input(itemSchema.omit({
        id: true
    })).mutation(async ({ctx, input}) => {
        return await ctx.database.item.create({
            data: input
        });
    }),

    update: publicProcedure.input(itemSchema.omit({
        groupId: true
    })).mutation(async ({ctx, input}) => {
        const {id, ...data} = input;
        return await ctx.database.item.update({
            data: data,
            where: {
                id: id
            }
        });
    }),

    delete: publicProcedure.input(itemSchema.pick({
        id: true
    })).mutation(async ({ctx, input}) => {
        if (await ctx.database.order.count({
            where: {
                itemId: input.id,
                status: {
                    not: "failed"
                }
            }
        }) != 0) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "该商品有相关联的订单且为正常状态不得删除"
            });
        }
        await ctx.database.item.delete({
            where: {
                id: input.id
            }
        });
    })
})

export default itemRouter;

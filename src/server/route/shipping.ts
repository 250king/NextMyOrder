import track from "@/util/client/track";
import {queryDsl, SafeRule, whereBuilder} from "@/util/query";
import {shippingData} from "@/type/shipping";
import {procedure} from "@/server/server";
import {TRPCError} from "@trpc/server";

const shippingRouter = {
    shippingGetById: procedure.input(shippingData.pick({
        id: true,
    })).query(async ({ctx, input}) => {
        const shipping = await ctx.db.shipping.findUnique({
            where: {
                id: input.id,
            },
            include: {
                items: true,
            },
        });
        if (!shipping) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "该运单不存在",
            });
        }
        return shipping;
    }),

    shippingGetAll: procedure.input(queryDsl).query(async ({ctx, input}) => {
        const rule: SafeRule = {
            filter: [
                {
                    field: "id",
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
            sort: ["id", "expressNumber", "tax", "fee", "createAt"],
            search: ["expressNumber"],
        };
        const [data, total] = await Promise.all([
            ctx.db.shipping.findMany(whereBuilder(input, rule)),
            ctx.db.shipping.count(whereBuilder(input, rule, true)),
        ]);
        return {
            items: data,
            total: total,
        };
    }),

    shippingCreate: procedure.input(shippingData.omit({
        id: true,
    })).mutation(async ({ctx, input}) => {
        const {itemIds, ...data} = input;
        if (input.expressNumber) {
            if (await ctx.db.shipping.findUnique({
                where: {
                    expressNumber: input.expressNumber,
                },
            })) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "该运单已存在",
                });
            }
            await track.post("/register", [{
                number: input.expressNumber,
                lang: "zh",
            }]);
        }
        return await ctx.db.shipping.create({
            data: {
                ...data,
                items: {
                    connect: itemIds.map((id) => ({id})),
                },
            },
        });
    }),

    shippingUpdate: procedure.input(shippingData.omit({
        expressNumber: true,
    })).mutation(async ({ctx, input}) => {
        const {id, ...data} = input;
        const shipping = await ctx.db.shipping.findUnique({
            where: {
                id: id,
            },
        });
        if (!shipping) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "该运单不存在",
            });
        }
        return await ctx.db.shipping.update({
            where: {
                id: id,
            },
            data: {
                ...data,
            },
        });
    }),

    shippingAddItems: procedure.input(shippingData.pick({
        id: true,
        itemIds: true,
    })).mutation(async ({ctx, input}) => {
        if (!await ctx.db.shipping.findUnique({
            where: {
                id: input.id,
            },
        })) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "该运单不存在",
            });
        }
        const result = await ctx.db.item.updateMany({
            where: {
                id: {
                    in: input.itemIds,
                },
            },
            data: {
                shippingId: input.id,
            },
        });
        return {
            total: result.count,
        };
    }),

    shippingDeleteItem: procedure.input(shippingData.pick({
        id: true,
        itemId: true,
    })).mutation(async ({ctx, input}) => {
        if (!await ctx.db.item.findUnique({
            where: {
                id: input.itemId,
                shippingId: input.id,
            },
        })) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "该商品不存在或不在该运单中",
            });
        }
        await ctx.db.item.update({
            where: {
                id_shippingId: {
                    id: input.itemId,
                    shippingId: input.id,
                },
            },
            data: {
                shippingId: null,
            },
        });
    }),

    shippingDelete: procedure.input(shippingData.pick({
        id: true,
    })).mutation(async ({ctx, input}) => {
        const shipping = await ctx.db.shipping.findUnique({
            where: {
                id: input.id,
            },
        });
        if (!shipping) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "该运单不存在",
            });
        }
        if (shipping.expressNumber) {
            await track.post("/deletetrack", [{
                number: shipping.expressNumber,
            }]);
        }
        return await ctx.db.shipping.delete({
            where: {
                id: input.id,
            },
        });
    }),
};

export default shippingRouter;

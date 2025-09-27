import parseItem from "@repo/util/item/index";
import {queryDsl, SafeRule, whereBuilder} from "@repo/util/data/query";
import {itemData} from "@repo/schema/item";
import {procedure} from "@/trpc/server";
import {TRPCError} from "@trpc/server";

const itemRouter = {
    itemGetAll: procedure.input(queryDsl).query(async ({ctx, input}) => {
        const rule: SafeRule = {
            filter: [
                {field: "id", operator: ["eq"]},
                {field: "groupId", operator: ["eq"]},
                {field: "group.ended", operator: ["eq"]},
                {field: "item.allowed", operator: ["eq"]},
                {field: "orders.some.shippingId", operator: ["eq"]},
                {field: "orders.some.userId", operator: ["eq"]},
            ],
            column: {
                modal: "Item",
                include: ["group"],
            },
            sort: ["id", "name", "price", "weight", "allowed"],
            search: ["name", "url"],
        };
        const [data, total] = await Promise.all([
            ctx.db.item.findMany(whereBuilder(input, rule)),
            ctx.db.item.count(whereBuilder(input, rule, true)),
        ]);
        return {
            items: data,
            total: total,
        };
    }),

    itemGetInfo: procedure.input(itemData.pick({
        url: true,
    })).query(async ({input}) => {
        const result = await parseItem(input.url);
        if (!result) {
            throw new TRPCError({
                code: "NOT_FOUND",
            });
        }
        return result;
    }),

    itemCreate: procedure.input(itemData.pick({
        groupId: true,
        name: true,
        url: true,
        image: true,
        price: true,
        weight: true,
    })).mutation(async ({ctx, input}) => {
        if (!await ctx.db.group.findUnique({
            where: {
                id: input.groupId,
            },
        })) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "团购不存在",
            });
        }
        if (await ctx.db.item.findUnique({
            where: {
                groupId_name_url_price: {
                    groupId: input.groupId,
                    name: input.name,
                    url: input.url,
                    price: input.price,
                },
            },
        })) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "该商品已存在",
            });
        }
        return await ctx.db.item.create({
            data: input,
        });
    }),

    itemCreateAll: procedure.input(itemData.pick({
        groupId: true,
        urls: true,
    })).mutation(async ({ctx, input}) => {
        if (!await ctx.db.group.findUnique({
            where: {
                id: input.groupId,
            },
        })) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "团购不存在",
            });
        }
        const items = [];
        for (const url of input.urls) {
            const result = await parseItem(url);
            if (!result) {
                continue;
            }
            if (await ctx.db.item.findFirst({
                where: {
                    ...result,
                    groupId: input.groupId,
                },
            })) {
                continue;
            }
            items.push(await ctx.db.item.create({
                data: {
                    ...result,
                    groupId: input.groupId,
                    allowed: true,
                },
            }));
        }
        return {
            items: items,
            total: items.length,
        };
    }),

    itemUpdate: procedure.input(itemData.pick({
        id: true,
        name: true,
        url: true,
        image: true,
        price: true,
        weight: true,
    })).mutation(async ({ctx, input}) => {
        const {id, ...data} = input;
        const item = await ctx.db.item.findUnique({
            where: {
                id: id,
            },
        });
        if (!item) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "商品不存在",
            });
        }
        if (item.url !== data.url || item.name !== data.name || item.price !== data.price) {
            await ctx.db.list.updateMany({
                where: {
                    user: {
                        orders: {
                            some: {
                                item: {
                                    id: id,
                                },
                            },
                        },
                    },
                    finished: false,
                },
                data: {
                    confirmed: false,
                },
            });
        }
        return await ctx.db.item.update({
            where: {
                id: id,
            },
            data: data,
        });
    }),

    itemAllowAll: procedure.input(itemData.pick({
        ids: true,
    })).mutation(async ({ctx, input}) => {
        return {
            total: (await ctx.db.item.updateMany({
                where: {
                    id: {
                        in: input.ids,
                    },
                },
                data: {
                    allowed: true,
                },
            })).count,
        };
    }),

    itemPush: procedure.input(itemData.pick({
        items: true,
    })).mutation(async ({ctx, input}) => {
        let total = 0;
        for (const i of input.items) {
            if (i.count === 0 || !await ctx.db.item.findUnique({
                where: {
                    id: i.id,
                },
            })) {
                continue;
            }
            const orders = await ctx.db.order.findMany({
                where: {
                    itemId: i.id,
                    status: "pending",
                },
                orderBy: [
                    {createdAt: "asc"},
                    {id: "asc"},
                ],
                take: i.count,
            });
            await ctx.db.order.updateMany({
                where: {
                    id: {
                        in: orders.map(o => o.id),
                    },
                },
                data: {
                    status: "pushed",
                },
            });
            total ++;
        }
        return {
            total: total,
        };
    }),

    itemCheck: procedure.input(itemData.pick({
        items: true,
    })).mutation(async ({ctx, input}) => {
        let total = 0;
        for (const i of input.items) {
            if (i.count === 0 || !await ctx.db.item.findUnique({
                where: {
                    id: i.id,
                },
            })) {
                continue;
            }
            const orders = await ctx.db.order.findMany({
                where: {
                    itemId: i.id,
                    status: "pushed",
                },
                orderBy: [
                    {createdAt: "asc"},
                    {id: "asc"},
                ],
                take: i.count,
            });
            await ctx.db.order.updateMany({
                where: {
                    id: {
                        in: orders.map(o => o.id),
                    },
                },
                data: {
                    status: "arrived",
                },
            });
            total ++;
        }
        return {
            total: total,
        };
    }),

    itemDelete: procedure.input(itemData.pick({
        id: true,
    })).mutation(async ({ctx, input}) => {
        const item = await ctx.db.item.findUnique({
            where: {
                id: input.id,
            },
            include: {
                orders: true,
            },
        });
        if (!item) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "商品不存在",
            });
        }
        if (item.orders.length !== 0) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "有订单引用该商品，无法删除",
            });
        }
        await ctx.db.item.delete({
            where: {
                id: item.id,
            },
        });
    }),
};

export default itemRouter;

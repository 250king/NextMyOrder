import {queryDsl, SafeRule, whereBuilder} from "@repo/util/data/query";
import {paymentData} from "@repo/schema/payment";
import {procedure} from "@/trpc/server";
import {TRPCError} from "@trpc/server";

const paymentRouter = {
    paymentGetById: procedure.input(paymentData.pick({
        id: true,
    })).query(async ({ctx, input}) => {
        const item = await ctx.db.payment.findUnique({
            where: {
                id: input.id,
            },
        });
        if (!item) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "运单不存在",
            });
        }
        return item;
    }),

    paymentGetAll: procedure.input(queryDsl).query(async ({ctx, input}) => {
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
                    field: "payMethod",
                    operator: ["eq"],
                },
                {
                    field: "baseCurrency",
                    operator: ["eq"],
                },
                {
                    field: "status",
                    operator: ["eq"],
                },
            ],
            column: {
                modal: "Payment",
                include: ["user"],
            },
            sort: ["id", "userId", "type", "amount", "payMethod", "createdAt", "paidAt", "status"],
        };
        const [data, total] = await Promise.all([
            ctx.db.payment.findMany(whereBuilder(input, rule)),
            ctx.db.payment.count(whereBuilder(input, rule, true)),
        ]);
        return {
            items: data,
            total: total,
        };
    }),

    paymentCreateAll: procedure.input(paymentData.pick({
        type: true,
        objectId: true,
        exchangeRate: true,
    })).mutation(async ({ctx, input}) => {
        if (!input.objectId) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "关联对象ID不能为空",
            });
        }
        switch (input.type) {
            case "group": {
                if (!await ctx.db.group.findUnique({
                    where: {
                        id: input.objectId,
                        lists: {
                            every: {
                                confirmed: true,
                            },
                        },
                    },
                })) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "团购不存在或有未确认的清单",
                    });
                }
                let result = 0;
                const lists = await ctx.db.userSummary.findMany({
                    where: {
                        groupId: input.objectId,
                    },
                });
                for (const i of lists) {
                    await ctx.db.payment.create({
                        data: {
                            userId: i.id,
                            objectId: i.id,
                            type: "list",
                            amount: i.total,
                            baseCurrency: "JPY",
                            exchangeRate: input.exchangeRate,
                            status: "pending",
                        },
                    });
                    result++;
                }
                return {
                    total: result,
                    getInput: input, 
                    lists: lists,
                };
            }
            case "shipping_tax": {
                if (!await ctx.db.shipping.findUnique({
                    where: {
                        id: input.objectId,
                        tax: {
                            gt: 0,
                        },
                    },
                })) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "运单不存在或无税金",
                    });
                }
                let result = 0;
                const lists = await ctx.db.taxSummary.findMany({
                    where: {
                        shippingId: input.objectId,
                    },
                });
                for (const i of lists) {
                    await ctx.db.payment.create({
                        data: {
                            userId: i.id,
                            objectId: i.id,
                            type: "tax",
                            amount: i.total,
                            baseCurrency: "CNY",
                            exchangeRate: input.exchangeRate,
                            status: "pending",
                        },
                    });
                    result++;
                }
                return {
                    total: result,
                };
            }
            case "shipping_fee": {
                if (!await ctx.db.shipping.findUnique({
                    where: {
                        id: input.objectId,
                        fee: {
                            gt: 0,
                        },
                    },
                })) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "运单不存在或无运费",
                    });
                }
                let result = 0;
                const lists = await ctx.db.weightSummary.findMany({
                    where: {
                        shippingId: input.objectId,
                    },
                });
                for (const i of lists) {
                    await ctx.db.payment.create({
                        data: {
                            userId: i.id,
                            objectId: i.id,
                            type: "tax",
                            amount: i.total,
                            baseCurrency: "CNY",
                            exchangeRate: input.exchangeRate,
                            status: "pending",
                        },
                    });
                    result++;
                }
                return {
                    total: result,
                };
            }
        }
    }),
};

export default paymentRouter;

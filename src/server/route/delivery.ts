import $ from "@/util/client/kd100";
import {publicProcedure, router} from "@/server/loader";
import {queryParams, queryParser} from "@/util/query";
import {deliverySchema} from "@/type/delivery";
import {TRPCError} from "@trpc/server";
import {number, object} from "zod";
import {parse} from "@/util/data/setting";

const deliveryRouter = router({
    get: publicProcedure.input(queryParams).query(async ({ctx, input}) => {
        const query = queryParser(input, ["name", "phone"])
        return {
            items: await ctx.database.delivery.findMany({...query, include: {orders: true}}),
            total: await ctx.database.delivery.count({where: query.where})
        };
    }),

    create: publicProcedure.input(deliverySchema.omit({
        id: true
    })).mutation(async ({ctx, input}) => {
        return await ctx.database.delivery.create({
            data: {
                ...input,
                orders: {
                    connect: input.orders.map((id: number) => ({id}))
                }
            }
        });
    }),

    update: publicProcedure.input(deliverySchema.omit({
        orders: true,
        status: true
    })).mutation(async ({ctx, input}) => {
        const {id, ...data} = input;
        if (!await ctx.database.delivery.findUnique({
            where: {
                id,
                status: "pending"
            }
        })) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "该运单已推送不允许修改"
            });
        }
        return await ctx.database.delivery.update({
            data: data,
            where: {id}
        });
    }),

    delete: publicProcedure.input(deliverySchema.pick({
        id: true
    })).mutation(async ({ctx, input}) => {
        if (!await ctx.database.delivery.findUnique({
            where: {
                id: input.id,
                status: "pending"
            }
        })) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "该订单已推送不允许删除"
            });
        }
        await ctx.database.delivery.delete({
            where: {
                id: input.id,
                status: "pending"
            }
        });
    }),

    flow: publicProcedure.input(deliverySchema.pick({
        id: true
    })).mutation(async ({ctx, input}) => {
        const item = await ctx.database.delivery.findUnique({
            where: {
                id: input.id,
                status: {
                    in: ["pushed", "waiting"]
                }
            }
        });
        if (!item) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "该运单不存在或已取消"
            });
        }
        const url = "https://order.kuaidi100.com/order/corderapi.do"
        const payload = new URLSearchParams();
        payload.set("param", JSON.stringify({
            taskId: item.taskId,
            orderId: item.expressId,
            cancelMsg: "用户取消"
        }));
        payload.set("method", "cancel");
        const res = await $.post(url, payload);
        if (!res.data.result) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "取消运单失败，请前往管理后台查看详情"
            });
        }
        await ctx.database.order.updateMany({
            where: {
                deliveryId: input.id
            },
            data: {
                deliveryId: null
            }
        })
        return await ctx.database.delivery.update({
            where: {
                id: input.id
            },
            data: {
                status: "failed"
            }
        })
    }),

    push: publicProcedure.input(object({
        ids: number().array()
    })).mutation(async ({ctx, input}) => {
        const setting = await parse()
        const items = await ctx.database.delivery.findMany({
            where: {
                id: {
                    in: input.ids
                },
                status: "pending"
            }
        })
        if (items.length === 0) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "没有需要推送的运单"
            })
        }
        const url = "https://order.kuaidi100.com/order/corderapi.do"
        let error = false;
        for (const item of items) {
            const payload = new URLSearchParams();
            payload.set("param", JSON.stringify({
                kuaidicom: item.method,
                recManName: item.name,
                recManMobile: item.phone,
                recManPrintAddr: item.address,
                sendManName: setting.name,
                sendManMobile: setting.phone,
                sendManPrintAddr: setting.address,
                callBackUrl: setting.callback,
                salt: process.env.APP_KEY,
                cargo: setting.cargo
            }));
            payload.set("method", "cOrder");
            const res = await $.post(url, payload);
            if (!res.data.result) {
                error = true;
                continue;
            }
            await ctx.database.delivery.update({
                where: {
                    id: item.id
                },
                data: {
                    status: "pushed",
                    taskId: res.data.data?.taskId ?? null,
                    expressId: res.data.data?.orderId ?? null,
                    expressNumber: res.data.data?.kuaidinum ?? null
                }
            })
        }
        if (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "部分运单推送失败，请前往管理后台查看详情"
            });
        }
    })
})

export default deliveryRouter;

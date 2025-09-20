import React from "react";
import DeliveryEmail from "@repo/component/template/email/delivery";
import sendEmail from "@repo/util/client/smtp";
import $ from "@repo/util/client/kd100";
import {queryDsl, SafeRule, whereBuilder} from "@repo/util/data/query";
import {deliveryData} from "@repo/schema/delivery";
import {getSetting} from "@repo/util/data/setting";
import {setTimeout} from 'timers/promises';
import {render} from "@react-email/render";
import {procedure} from "@/trpc/server";
import {TRPCError} from "@trpc/server";

const deliveryRouter = {
    deliveryGetById: procedure.input(deliveryData.pick({
        id: true,
    })).query(async ({ctx, input}) => {
        const item = await ctx.db.delivery.findUnique({
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

    deliveryGetAll: procedure.input(queryDsl).query(async ({ctx, input}) => {
        const rule: SafeRule = {
            filter: [
                {
                    field: "id",
                    operator: ["eq"],
                },
                {
                    field: "company",
                    operator: ["eq"],
                },
                {
                    field: "status",
                    operator: ["eq"],
                },
            ],
            column: {
                modal: "Delivery",
                include: ["user"],
            },
            sort: ["id", "expressNumber", "tax", "fee", "createAt"],
            search: ["expressNumber", "name", "phone", "address"],
        };
        const [data, total] = await Promise.all([
            ctx.db.delivery.findMany(whereBuilder(input, rule)),
            ctx.db.delivery.count(whereBuilder(input, rule, true)),
        ]);
        return {
            items: data,
            total: total,
        };
    }),

    deliveryCreate: procedure.input(deliveryData.pick({
        userId: true,
        orderIds: true,
        name: true,
        phone: true,
        company: true,
        address: true,
        comment: true,
    })).mutation(async ({ctx, input}) => {
        const {orderIds, ...data} = input;
        return await ctx.db.delivery.create({
            data: {
                ...data,
                orders: {
                    create: orderIds.map(i => ({
                        order: {
                            connect: {
                                id: i,
                            },
                        },
                    })),
                },
            },
        });
    }),

    deliveryUpdate: procedure.input(deliveryData.pick({
        id: true,
        name: true,
        phone: true,
        company: true,
        address: true,
        comment: true,
    })).mutation(async ({ctx, input}) => {
        const {id, ...data} = input;
        if (!await ctx.db.delivery.findUnique({
            where: {
                id,
                status: "pending",
            },
        })) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "该运单已推送不允许修改",
            });
        }
        return await ctx.db.delivery.update({
            data: data,
            where: {id},
        });
    }),

    deliveryAddOrders: procedure.input(deliveryData.pick({
        id: true,
        orderIds: true,
    })).mutation(async ({ctx, input}) => {
        if (!await ctx.db.delivery.findUnique({
            where: {
                id: input.id,
            },
        })) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "该运单不存在",
            });
        }
        const result = await ctx.db.deliveryOrder.createMany({
            data: input.orderIds.map(i => ({
                deliveryId: input.id,
                orderId: i,
            })),
            skipDuplicates: true,
        });
        return {
            total: result.count,
        };
    }),

    deliveryDeleteOrder: procedure.input(deliveryData.pick({
        id: true,
        orderId: true,
    })).mutation(async ({ctx, input}) => {
        if (!await ctx.db.deliveryOrder.findUnique({
            where: {
                deliveryId_orderId: {
                    deliveryId: input.id,
                    orderId: input.orderId,
                },
            },
        })) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "该商品不存在或不在该运单中",
            });
        }
        await ctx.db.deliveryOrder.delete({
            where: {
                deliveryId_orderId: {
                    deliveryId: input.id,
                    orderId: input.orderId,
                },
            },
        });
    }),

    deliveryDelete: procedure.input(deliveryData.pick({
        id: true,
    })).mutation(async ({ctx, input}) => {
        if (!await ctx.db.delivery.findUnique({
            where: {
                id: input.id,
                status: "pending",
            },
        })) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "该订单已推送不允许删除",
            });
        }
        await ctx.db.delivery.delete({
            where: {
                id: input.id,
                status: "pending",
            },
        });
    }),

    deliveryCancel: procedure.input(deliveryData.pick({
        id: true,
    })).mutation(async ({ctx, input}) => {
        const item = await ctx.db.delivery.findUnique({
            where: {
                id: input.id,
                status: {
                    in: ["pushed", "waiting"],
                },
            },
        });
        if (!item) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "该运单不存在或已取消",
            });
        }
        const url = "https://order.kuaidi100.com/order/corderapi.do";
        const payload = new URLSearchParams();
        payload.set("param", JSON.stringify({
            taskId: item.taskId,
            orderId: item.expressId,
            cancelMsg: "用户取消",
        }));
        payload.set("method", "cancel");
        const res = await $.post(url, payload);
        if (!res.data.result) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "取消运单失败，请前往管理后台查看详情",
            });
        }
        return await ctx.db.delivery.update({
            where: {
                id: input.id,
            },
            data: {
                status: "failed",
            },
        });
    }),

    deliveryPush: procedure.input(deliveryData.pick({
        ids: true,
    })).mutation(async ({ctx, input}) => {
        const setting = await getSetting();
        const items = await ctx.db.delivery.findMany({
            where: {
                id: {
                    in: input.ids,
                },
                status: "pending",
            },
        });
        if (items.length === 0) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "没有需要推送的运单",
            });
        }
        const url = "https://order.kuaidi100.com/order/corderapi.do";
        let error = false;
        for (const item of items) {
            const payload = new URLSearchParams();
            payload.set("param", JSON.stringify({
                kuaidicom: item.company,
                recManName: item.name,
                recManMobile: item.phone,
                recManPrintAddr: item.address,
                sendManName: setting.name,
                sendManMobile: setting.phone,
                sendManPrintAddr: setting.address,
                callBackUrl: process.env.CALLBACK_URL,
                salt: process.env.APP_KEY,
                cargo: setting.cargo,
            }));
            payload.set("method", "cOrder");
            const res = await $.post(url, payload);
            if (!res.data.result) {
                error = true;
                continue;
            }
            await ctx.db.delivery.update({
                where: {
                    id: item.id,
                },
                data: {
                    status: "pushed",
                    taskId: res.data.data?.taskId ?? null,
                    expressId: res.data.data?.orderId ?? null,
                    expressNumber: res.data.data?.kuaidinum ?? null,
                },
            });
        }
        if (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "部分运单推送失败，请前往管理后台查看详情",
            });
        }
    }),

    deliverySendTicket: procedure.input(deliveryData.pick({
        ids: true,
    })).mutation(async ({ctx, input}) => {
        let result = 0;
        for (const i of input.ids) {
            const delivery = await ctx.db.delivery.findUnique({
                where: {
                    id: i,
                    status: "pending",
                },
                include: {
                    orders: true,
                    user: true,
                },
            });
            if (!delivery || delivery.orders.length === 0) {
                continue;
            }
            const to = delivery.user.email? delivery.user.email : `${delivery.user.qq}@qq.com`;
            const subject = `请完善您的运单信息`;
            const content = await render(React.createElement(DeliveryEmail, {data: delivery}));
            setTimeout(Math.floor(Math.random() * 31) * 1000).then(() => {
                sendEmail(to, subject, content).catch((error) => {
                    console.error(`向${to}发送邮件失败: ${error}`);
                });
            });
            result++;
        }
        return {
            total: result,
        };
    }),
};

export default deliveryRouter;

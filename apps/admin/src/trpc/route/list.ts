import React from "react";
import ConfirmEmail from "@repo/component/template/email/confirm";
import sendEmail from "@repo/util/client/smtp";
import {queryDsl, SafeRule, whereBuilder} from "@repo/util/data/query";
import {listData} from "@repo/schema/list";
import {render} from "@react-email/render";
import {setTimeout} from 'timers/promises';
import {procedure} from "@/trpc/server";
import {TRPCError} from "@trpc/server";
import {createJWT} from "@repo/util/security/jwt";

const listRouter = {
    listGetLink: procedure.input(listData.pick({
        id: true,
    })).query(async ({ctx, input}) => {
        const list = await ctx.db.list.findUnique({
            where: {
                id: input.id,
            },
            include: {
                user: {
                    include: {
                        orders: true,
                    },
                },
                group: true,
            },
        });
        if (!list || list.user.orders.length === 0) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "未找到相关记录或用户无订单",
            });
        }
        const jwt = await createJWT({
            groupId: list.groupId,
        }, list.userId.toString(), "confirm", "30d");
        const url = `${process.env.PUBLIC_APP_URL}/confirm?token=${jwt}`;
        return {
            result: url,
        };
    }),

    listGetAll: procedure.input(queryDsl).query(async ({ctx, input}) => {
        const rule: SafeRule = {
            filter: [
                {field: "id", operator: ["eq"]},
                {field: "groupId", operator: ["eq"]},
                {field: "confirmed", operator: ["eq"]},
                {field: "finished", operator: ["eq"]},
            ],
            column: {
                modal: "List",
                include: ["user"],
                block: ["user.address", "user.phone"],
            },
            sort: ["id", "qq", "email", "createdAt", "confirmed"],
            search: ["name", "qq", "email"],
        };
        const [data, total] = await Promise.all([
            ctx.db.list.findMany(whereBuilder(input, rule)),
            ctx.db.list.count(whereBuilder(input, rule, true)),
        ]);
        return {
            items: data,
            total: total,
        };
    }),

    listCreateAll: procedure.input(listData).mutation(async ({ctx, input}) => {
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
        let result = 0;
        for (const userId of input.userIds) {
            if (await ctx.db.list.findUnique({
                where: {
                    userId_groupId: {
                        groupId: input.groupId,
                        userId: userId,
                    },
                },
            })) {
                continue;
            }
            await ctx.db.list.create({
                data: {
                    groupId: input.groupId,
                    userId: userId,
                },
            });
            result++;
        }
        return {
            total: result,
        };
    }),

    listSendEmail: procedure.input(listData.pick({
        id: true,
    })).mutation(async ({ctx, input}) => {
        const list = await ctx.db.list.findUnique({
            where: {
                id: input.id,
            },
            include: {
                user: {
                    include: {
                        orders: true,
                    },
                },
                group: true,
            },
        });
        if (!list) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "未找到相关记录",
            });
        }
        if (list.user.orders.length === 0) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "用户无订单",
            });
        }
        if (list.confirmed) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "用户已确认",
            });
        }
        const to = list.user.email? list.user.email : `${list.user.qq}@qq.com`;
        const subject = `确认您的需求列表`;
        const content = await render(React.createElement(ConfirmEmail, {data: list}));
        setTimeout(Math.floor(Math.random() * 31) * 1000).then(() => {
            sendEmail(to, subject, content).catch((error) => {
                console.error(`发送邮件失败: ${error}`);
            });
        });
    }),

    listSendEmailAll: procedure.input(listData.pick({
        groupId: true,
    })).mutation(async ({ctx, input}) => {
        const lists = await ctx.db.list.findMany({
            where: {
                groupId: input.groupId,
                confirmed: false,
                user: {
                    orders: {
                        some: {
                            item: {
                                groupId: input.groupId,
                            },
                        },
                    },
                },
            },
            include: {
                user: true,
                group: true,
            },
        });
        for (const i of lists) {
            const to = i.user.email? i.user.email : `${i.user.qq}@qq.com`;
            const subject = `确认您的需求列表`;
            const content = await render(React.createElement(ConfirmEmail, {data: i}));
            setTimeout(Math.floor(Math.random() * 31) * 1000).then(() => {
                sendEmail(to, subject, content).catch((error) => {
                    console.error(`发送邮件失败: ${error}`);
                });
            });
        }
        return {
            total: lists.length,
        };
    }),

    listDelete: procedure.input(listData.pick({
        groupId: true,
        userId: true,
    })).mutation(async ({ctx, input}) => {
        if (!await ctx.db.list.findUnique({
            where: {
                userId_groupId: {
                    groupId: input.groupId,
                    userId: input.userId,
                },
            },
        })) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "未找到相关记录",
            });
        }
        if (await ctx.db.order.count({
            where: {
                userId: input.groupId,
                item: {
                    groupId: input.groupId,
                },
                status: {
                    not: "pending",
                },
            },
        }) != 0) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "用户仍有订单，无法移除",
            });
        }
        await ctx.db.list.delete({
            where: {
                userId_groupId: {
                    groupId: input.groupId,
                    userId: input.userId,
                },
            },
        });
    }),
};

export default listRouter;

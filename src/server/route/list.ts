import React from "react";
import ConfirmEmail from "@/template/email/confirm";
import sendEmail from "@/util/client/smtp";
import {queryDsl, SafeRule, whereBuilder} from "@/util/query";
import {listData} from "@/type/list";
import {render} from "@react-email/render";
import {setTimeout} from 'timers/promises';
import {procedure} from "@/server/server";
import {TRPCError} from "@trpc/server";
import {z} from "zod/v4";

const listRouter = {
    listGetAll: procedure.input(queryDsl).query(async ({ctx, input}) => {
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
                    field: "confirmed",
                    operator: ["eq"],
                },
            ],
            sort: ["id", "qq", "email", "createdAt", "confirmed"],
            search: ["name", "qq", "email"],
        };
        const [data, total] = await Promise.all([
            ctx.db.listView.findMany(whereBuilder(input, rule)),
            ctx.db.listView.count(whereBuilder(input, rule, true)),
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

    listSendConfirm: procedure.input(listData).mutation(async ({ctx, input}) => {
        for (const userId of input.userIds) {
            const join = await ctx.db.list.findUnique({
                where: {
                    userId_groupId: {
                        groupId: input.groupId,
                        userId: userId,
                    },
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
            if (!join || join.user.orders.length === 0) {
                continue;
            }
            const to = join.user.email? join.user.email : `${join.user.qq}@qq.com`;
            const subject = `确认您的需求列表`;
            const content = await render(React.createElement(ConfirmEmail, {data: join}));
            setTimeout(Math.floor(Math.random() * 31) * 1000).then(() => {
                sendEmail(to, subject, content).catch((error) => {
                    console.error(`发送邮件失败: ${error}`);
                });
            });
        }
    }),

    listDelete: procedure.input(listData.pick({
        groupId: true,
    }).extend({
        userId: z.number(),
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

import {queryDsl, SafeRule, whereBuilder} from "@repo/util/data/query";
import {listData} from "@repo/schema/list";
import {TRPCError} from "@trpc/server";
import {base} from "@/trpc/server";

const procedure = base.use(async (opts) => {
    const {ctx} = opts;
    if (ctx.token?.payload.aud !== "confirm") {
        throw new TRPCError({code: "FORBIDDEN", message: "You are not authorized to access this resource."});
    }
    return opts.next({ctx});
});

const confirmRouter = {
    confirmGetAll: procedure.input(queryDsl).query(async ({ctx, input}) => {
        const rule: SafeRule = {
            filter: [
                {field: "userId", operator: ["eq"]},
                {field: "item.groupId", operator: ["eq"]},
            ],
            column: {
                modal: "Order",
                include: ["item"],
            },
            sort: ["id", "itemId", "count", "total", "createAt"],
        };
        input.filter = [
            {field: "userId", operator: "eq", value: ctx.user!.id},
            {field: "item.groupId", operator: "eq", value: Number(ctx.token!.payload.groupId)},
        ];
        const [data, total] = await Promise.all([
            ctx.db.order.findMany(whereBuilder(input, rule)),
            ctx.db.order.count(whereBuilder(input, rule, true)),
        ]);
        return {
            items: data,
            total: total,
        };
    }),

    confirmOk: procedure.input(listData.pick({
        groupId: true,
    })).mutation(async ({ctx, input}) => {
        if (!await ctx.db.list.findUnique({
            where: {
                userId_groupId: {
                    userId: ctx.user!.id,
                    groupId: input.groupId,
                },
            },
        })) {
            throw new TRPCError({code: "NOT_FOUND"});
        }
        await ctx.db.list.update({
            where: {
                userId_groupId: {
                    userId: ctx.user!.id,
                    groupId: input.groupId,
                },
            },
            data: {
                confirmed: true,
            },
        });
    }),
};

export default confirmRouter;

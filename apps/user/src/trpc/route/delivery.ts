import {base} from "@/trpc/server";
import {TRPCError} from "@trpc/server";
import {queryDsl, SafeRule, whereBuilder} from "@repo/util/data/query";
import {deliveryData} from "@repo/schema/delivery";

const procedure = base.use(async (opts) => {
    const {ctx} = opts;
    if (ctx.token?.payload.aud !== "delivery") {
        throw new TRPCError({code: "FORBIDDEN", message: "You are not authorized to access this resource."});
    }
    return opts.next({ctx});
});

const deliveryRouter = {
    deliveryGetAll: procedure.input(queryDsl).query(async ({ctx, input}) => {
        const rule: SafeRule = {
            filter: [
                {field: "userId", operator: ["eq"]},
                {field: "deliveries.some.deliveryId", operator: ["eq"]},
            ],
            column: {
                modal: "Order",
                include: ["item", "delivery"],
            },
            sort: ["id", "itemId", "count", "total", "createAt"],
        };
        input.filter = [
            {field: "userId", operator: "eq", value: ctx.user!.id},
            {field: "deliveries.some.deliveryId", operator: "eq", value: Number(ctx.token!.payload.deliveryId)},
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

    deliverySubmit: procedure.input(deliveryData.pick({
        name: true,
        phone: true,
        address: true,
        company: true,
        save: true,
    })).mutation(async ({ctx, input}) => {
        const {save, ...data} = input;
        const deliveryId = Number(ctx.token!.payload.deliveryId);
        const delivery = await ctx.db.delivery.findUnique({
            where: {
                id: deliveryId,
            },
        });
        if (!delivery) {
            throw new TRPCError({code: "NOT_FOUND", message: "运单不存在"});
        }
        if (delivery.status !== "pending") {
            throw new TRPCError({code: "FORBIDDEN", message: "运单不可修改"});
        }
        await ctx.db.delivery.update({
            where: {
                id: deliveryId,
            },
            data: {
                ...data,
            },
        });
        if (save) {
            await ctx.db.user.update({
                where: {
                    id: ctx.user!.id,
                },
                data: {
                    phone: data.phone,
                    address: data.address,
                },
            });
        }
    }),
};

export default deliveryRouter;

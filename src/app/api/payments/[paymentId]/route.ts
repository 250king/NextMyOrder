import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/service/db";
import { payment } from "@/service/db/schema";
import { getContext } from "@/util/context";

type Context = {
    params: Promise<{
        paymentId: string;
    }>;
};

export const GET = async (_: NextRequest, ctx: Context) => {
    const { paymentId } = await ctx.params;
    const context = await getContext();
    const data = await db.query.payment.findFirst({
        where: and(
            eq(payment.id, Number(paymentId)),
            ...(context.isAdmin ? [] : [eq(payment.userId, context.uid)])
        ),
    });
    if (!data) {
        return notFound();
    }
    return NextResponse.json({
        finished: !!data.paidAt,
    });
};

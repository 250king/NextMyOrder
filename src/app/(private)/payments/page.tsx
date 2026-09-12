import { and, eq, exists, isNotNull, isNull, type SQL } from "drizzle-orm";
import { PaymentCard } from "@/component/card/payment";
import { db } from "@/service/db";
import { Payment, PaymentItem } from "@/service/db/schema";
import { PaymentQuery } from "@/type/payment";
import { getContext } from "@/util/context";
import { toPagination } from "@/util/cover";

interface PageProps {
    searchParams: Promise<PaymentQuery>;
}

const Page = async ({ searchParams }: PageProps) => {
    const query = await searchParams;
    const context = await getContext();
    const pagination = toPagination(query);
    const filters: SQL[] = [eq(Payment.userId, context.uid!)];

    if (query.method) {
        filters.push(eq(Payment.method, query.method));
    }
    if (query.type) {
        filters.push(
            exists(
                db
                    .select({ id: PaymentItem.id })
                    .from(PaymentItem)
                    .where(and(eq(PaymentItem.paymentId, Payment.id), eq(PaymentItem.type, query.type)))
            )
        );
    }
    if (query.isPaid != undefined) {
        filters.push(query.isPaid === "true" ? isNotNull(Payment.paidAt) : isNull(Payment.paidAt));
    }

    const where = and(...filters);
    const [items, total] = await Promise.all([
        db.query.Payment.findMany({
            where,
            with: {
                items: true,
            },
            ...pagination,
            orderBy: (payment, { desc }) => [desc(payment.createdAt)],
        }),
        db.$count(Payment, where),
    ]);

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">账单</h1>
                <PaymentCard {...query} items={items} total={total} />
            </div>
        </div>
    );
};

export default Page;

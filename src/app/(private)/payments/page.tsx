import { and, eq, isNotNull, isNull, type SQL } from "drizzle-orm";
import { PaymentCard } from "@/component/card/payment";
import { db } from "@/service/db";
import { Payment } from "@/service/db/schema";
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
    const filters: SQL[] = [];
    if (!context.isAdmin) {
        filters.push(eq(Payment.userId, context.uid!));
    } else if (query.userId) {
        filters.push(eq(Payment.userId, query.userId));
    }
    if (query.method) {
        filters.push(eq(Payment.method, query.method));
    }
    if (query.type) {
        filters.push(eq(Payment.type, query.type));
    }
    if (query.isPaid != undefined) {
        filters.push(query.isPaid === "true"? isNotNull(Payment.paidAt) : isNull(Payment.paidAt));
    }
    const [items, total] = await Promise.all([
        db.query.Payment.findMany({
            where: and(...filters),
            with: {
                user: true,
            },
            ...pagination,
            orderBy: (payment, { desc }) => [desc(payment.createdAt)],
        }),
        db.$count(Payment, and(...filters)),
    ]);

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">账单</h1>
                <PaymentCard {...query} items={items} total={total} isAdmin={context.isAdmin} />
            </div>
        </div>
    );
};

export default Page;

import { and, eq, type SQL } from "drizzle-orm";
import { PaymentCard } from "@/component/card/payment";
import { PaymentQuery } from "@/type/payment";
import { getContext } from "@/util/context";
import { getPagination } from "@/util/query";
import { db } from "../../../service/db";
import { payment } from "../../../service/db/schema";

interface PageProps {
    searchParams: Promise<PaymentQuery>;
}

const Page = async ({ searchParams }: PageProps) => {
    const query = await searchParams;
    const context = await getContext();
    const filters: SQL[] = [];
    if (!context.isAdmin) {
        filters.push(eq(payment.userId, context.uid!));
    } else if (query.userId) {
        filters.push(eq(payment.userId, context.uid!));
    }
    if (query.method) {
        filters.push(eq(payment.method, query.method));
    }
    if (query.type) {
        filters.push(eq(payment.type, query.type));
    }
    const where = filters.length > 0 ? and(...filters) : undefined;
    const pagination = getPagination(query);
    const [items, total] = await Promise.all([
        await db.query.payment.findMany({
            where,
            with: {
                user: true,
            },
            ...pagination,
            orderBy: (payment, { desc }) => [desc(payment.createdAt)],
        }),
        db.$count(payment, and(...filters)),
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

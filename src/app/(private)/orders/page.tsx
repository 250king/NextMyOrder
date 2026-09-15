import { and, eq, ilike, type SQL } from "drizzle-orm";
import { OrderCard } from "@/component/card/group";
import { db } from "@/service/db";
import { Order } from "@/service/db/schema";
import { OrderQuery } from "@/type/order";
import { getContext } from "@/util/context";
import { toPagination } from "@/util/cover";

type PageProps = {
    searchParams: Promise<OrderQuery>;
};

const Page = async ({ searchParams }: PageProps) => {
    const query = await searchParams;
    const context = await getContext();
    const pagination = toPagination(query);
    const filters: SQL[] = [eq(Order.userId, context.uid!)];
    if (query.status) {
        filters.push(eq(Order.status, query.status));
    }
    if (query.keyword) {
        filters.push(ilike(Order.itemName, `%${query.keyword}%`));
    }
    const where = and(...filters);
    const [items, total] = await Promise.all([
        db.query.Order.findMany({
            where,
            ...pagination,
            orderBy: (order, { desc }) => [desc(order.createdAt)],
        }),
        db.$count(Order, where),
    ]);

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">订单</h1>
                <OrderCard {...query} items={items} total={total} />
            </div>
        </div>
    );
};

export default Page;

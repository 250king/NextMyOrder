import { eq } from "drizzle-orm";
import { OrderCard } from "@/component/card/group";
import { db } from "@/service/db";
import { Order } from "@/service/db/schema";
import { Query } from "@/type/common";
import { getContext } from "@/util/context";
import { toPagination } from "@/util/cover";

type PageProps = {
    searchParams: Promise<Query>;
};

const Page = async ({ searchParams }: PageProps) => {
    const query = await searchParams;
    const context = await getContext();
    const pagination = toPagination(query);
    const where = eq(Order.userId, context.uid!);
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
                <header className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">订单</h1>
                    <p className="text-sm text-muted">集中查看所有团购生成的正式订单。</p>
                </header>
                <OrderCard {...query} items={items} total={total} />
            </div>
        </div>
    );
};

export default Page;

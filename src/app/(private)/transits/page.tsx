import { and, eq, exists, ilike, or, type SQL } from "drizzle-orm";
import { TransitCard } from "@/component/card/group";
import { db } from "@/service/db";
import { Order, Transit } from "@/service/db/schema";
import { TransitQuery } from "@/type/transit";
import { getContext } from "@/util/context";
import { toPagination } from "@/util/cover";

type PageProps = {
    searchParams: Promise<TransitQuery>;
};

const Page = async ({ searchParams }: PageProps) => {
    const query = await searchParams;
    const context = await getContext();
    const pagination = toPagination(query);
    const filters: SQL[] = [
        exists(
            db
                .select({ id: Order.id })
                .from(Order)
                .where(and(eq(Order.transitId, Transit.id), eq(Order.userId, context.uid!)))
        ),
    ];
    if (query.status) {
        filters.push(eq(Transit.status, query.status));
    }
    if (query.keyword) {
        filters.push(
            or(
                ilike(Transit.carrier, `%${query.keyword}%`),
                ilike(Transit.ticketNum, `%${query.keyword}%`)
            )!
        );
    }
    const where = and(...filters);
    const [items, total] = await Promise.all([
        db
            .select()
            .from(Transit)
            .where(where)
            .limit(pagination.limit)
            .offset(pagination.offset),
        db.$count(Transit, where),
    ]);

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">国际运单</h1>
                <TransitCard {...query} items={items} total={total} />
            </div>
        </div>
    );
};

export default Page;

import { notFound } from "next/navigation";
import { Chip, Surface } from "@heroui/react";
import { and, eq } from "drizzle-orm";
import { OrderCard } from "@/component/card/group";
import { db } from "@/service/db";
import { Order, Transit } from "@/service/db/schema";
import { Query } from "@/type/common";
import { colorMap, iconMap, statusMap, typeMap } from "@/type/transit";
import { getContext } from "@/util/context";
import { currency, date, toPagination } from "@/util/cover";

type PageProps = {
    params: Promise<{ transitId: number }>;
    searchParams: Promise<Query>;
};

const Page = async ({ params, searchParams }: PageProps) => {
    const path = await params;
    const query = await searchParams;
    const context = await getContext();
    const pagination = toPagination(query);
    const data = await db.query.Transit.findFirst({
        where: eq(Transit.id, path.transitId),
    });

    if (!data) {
        notFound();
    }

    const where = and(eq(Order.transitId, data.id), eq(Order.userId, context.uid!));
    const [items, total] = await Promise.all([
        db.query.Order.findMany({
            where,
            ...pagination,
            orderBy: (order, { desc }) => [desc(order.createdAt)],
        }),
        db.$count(Order, where),
    ]);

    if (total === 0) {
        notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <header className="flex flex-col gap-3">
                    <h1 className="text-2xl font-bold">
                        {data.carrier}
                        {data.ticketNum ? ` · ${data.ticketNum}` : ` #${data.id}`}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <Chip variant="primary">
                            <span className={iconMap[data.type]} />
                            <Chip.Label>{typeMap[data.type]}</Chip.Label>
                        </Chip>
                        <Chip variant="primary" color={colorMap[data.status]}>
                            {statusMap[data.status]}
                        </Chip>
                    </div>
                </header>

                <Surface className="rounded-3xl p-4 shadow-sm">
                    <h2 className="text-base font-semibold">基础信息</h2>
                    <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                        <div className="min-w-0">
                            <div className="text-muted">承运商</div>
                            <div className="font-medium">{data.carrier}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">快递单号</div>
                            <div className="font-medium">{data.ticketNum || "-"}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">税费</div>
                            <div className="font-medium">
                                {data.tax != null ? currency(data.tax, "CNY") : "-"}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">运费</div>
                            <div className="font-medium">
                                {data.fee != null ? currency(data.fee, "CNY") : "-"}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">创建时间</div>
                            <div className="font-medium">{date(data.createdAt)}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">更新时间</div>
                            <div className="font-medium">{date(data.updatedAt)}</div>
                        </div>
                        <div className="min-w-0 md:col-span-3">
                            <div className="text-muted">备注</div>
                            <div className="font-medium">{data.comment || "-"}</div>
                        </div>
                    </div>
                </Surface>

                <OrderCard {...query} items={items} total={total} />
            </div>
        </div>
    );
};

export default Page;

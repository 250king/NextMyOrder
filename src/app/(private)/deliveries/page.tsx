import React from "react";
import { and, eq, type SQL } from "drizzle-orm";
import { DeliveryCard } from "@/component/card/delivery";
import { db } from "@/service/db";
import { Delivery } from "@/service/db/schema";
import { DeliveryQuery } from "@/type/delivery";
import { getContext } from "@/util/context";
import { toPagination } from "@/util/cover";

type PageProps = {
    searchParams: Promise<DeliveryQuery>;
};

const Page = async ({ searchParams }: PageProps) => {
    const query = await searchParams;
    const context = await getContext();
    const pagination = toPagination(query);
    const filters: SQL[] = [eq(Delivery.userId, context.uid!)];
    if (query.status) {
        filters.push(eq(Delivery.status, query.status));
    }
    if (query.company) {
        filters.push(eq(Delivery.company, query.company));
    }
    const [items, total] = await Promise.all([
        db.query.Delivery.findMany({
            where: and(...filters),
            with: {
                user: true,
                deliveryToOrders: true,
            },
            ...pagination,
            orderBy: (delivery, { desc }) => [desc(delivery.createdAt)],
        }),
        db.$count(Delivery, and(...filters)),
    ]);

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">分发</h1>
                <DeliveryCard {...query} items={items} total={total} />
            </div>
        </div>
    );
};

export default Page;

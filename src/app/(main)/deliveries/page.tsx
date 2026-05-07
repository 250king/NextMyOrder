import React from "react";
import { and, eq, SQL } from "drizzle-orm";
import { DeliveryCard } from "@/component/card/delivery";
import { db } from "@/service/db";
import { delivery } from "@/service/db/schema";
import { DeliveryQuery } from "@/type/delivery";
import { getContext } from "@/util/context";
import { getPagination } from "@/util/query";

type PageProps = {
    searchParams: Promise<DeliveryQuery>;
}

const Page = async ({searchParams}: PageProps) => {
    const query = await searchParams;
    const context = await getContext();
    const pagination = getPagination(query);
    const filters: SQL[] = [];
    if (!context.isAdmin) {
        filters.push(eq(delivery.userId, BigInt(context.uid)));
    } else if (query.userId) {
        filters.push(eq(delivery.userId, BigInt(context.uid)));
    }
    if (query.status) {
        filters.push(eq(delivery.status, query.status));
    }
    if (query.company) {
        filters.push(eq(delivery.company, query.company));
    }
    const [items, total] = await Promise.all([
        await db.query.delivery.findMany({
            where: and(...filters),
            with: {
                user: true,
                deliveryToOrders: true,
            },
            ...pagination,
            orderBy: (delivery, { desc }) => [desc(delivery.createdAt)],
        }),
        db.$count(delivery, and(...filters)),
    ]);

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">分发</h1>
                <DeliveryCard {...query} items={items} total={total} isAdmin={context.isAdmin}/>
            </div>
        </div>
    )
}

export default Page

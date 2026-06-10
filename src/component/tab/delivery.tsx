import { eq } from "drizzle-orm";
import { db } from "@/service/db";
import { DeliveryToOrder } from "@/service/db/schema";
import { PanelProps, Query } from "@/type/common";
import { DeliveryResult } from "@/type/delivery";

export const GoodsPanel = async ({ data, page, size }: PanelProps<Omit<DeliveryResult, "user">> & Query) => {
    const [items, total] = await Promise.all([
        db.query.DeliveryToOrder.findMany({
            where: eq(DeliveryToOrder.deliveryId, data.id),
            with: {
                order: {
                    with: {
                        item: true,
                        transit: true,
                    },
                },
            },
        }),
        db.$count(DeliveryToOrder, eq(DeliveryToOrder.deliveryId, data.id)),
    ]);

    return (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
        </div>
    );
};

"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/service/db";
import { Address, Delivery } from "@/service/db/schema";
import { deliveryDetailSchema } from "@/type/delivery";
import { getContext } from "@/util/context";

export const getAddresses = async () => {
    const context = await getContext();
    return db.query.Address.findMany({
        where: eq(Address.userId, context.uid!),
        orderBy: [desc(Address.id)],
    });
};

export const saveDelivery = async (params: z.infer<typeof deliveryDetailSchema>) => {
    const context = await getContext();
    const { addressId, company, deliveryId } = deliveryDetailSchema.parse(params);

    const [delivery, address] = await Promise.all([
        db.query.Delivery.findFirst({
            where: and(
                eq(Delivery.id, deliveryId),
                eq(Delivery.userId, context.uid!),
                eq(Delivery.status, "PENDING")
            ),
        }),
        db.query.Address.findFirst({
            where: and(eq(Address.id, addressId), eq(Address.userId, context.uid!)),
        }),
    ]);

    if (!delivery) {
        throw new Error("当前分发信息无法修改");
    }
    if (!address) {
        throw new Error("地址不存在");
    }

    await db
        .update(Delivery)
        .set({
            recipient: address.recipient,
            phone: address.phone,
            address: address.address,
            company,
        })
        .where(and(eq(Delivery.id, deliveryId), eq(Delivery.userId, context.uid!)));

    revalidatePath("/deliveries");
    revalidatePath(`/deliveries/${deliveryId}`);
};

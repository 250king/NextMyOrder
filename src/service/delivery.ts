"use server";

import { notFound } from "next/navigation";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/service/db";
import { address as address_, delivery } from "@/service/db/schema";
import { DeliveryCompany } from "@/type/delivery";
import { getContext } from "@/util/context";

export const getAddresses = async (deliveryId: number) => {
    const context = await getContext();
    const current = await db.query.delivery.findFirst({
        where: and(eq(delivery.id, deliveryId), ...(context.isAdmin ? [] : [eq(delivery.userId, context.uid)])),
    });
    if (!current) {
        return notFound();
    }
    return db.query.address.findMany({
        where: eq(address_.userId, current.userId),
    });
};

export const saveDelivery = async (
    deliveryId: number,
    data: {
        recipient?: string | null;
        phone?: string | null;
        address?: string | null;
        addressId?: number | null;
        comment?: string | null;
        company?: DeliveryCompany | null;
        save?: boolean;
    }
) => {
    const { addressId, comment, save, company } = data;
    let { recipient, phone, address } = data;
    if (!deliveryId && !recipient) {
        throw new Error("deliveryId is required");
    }
    const context = await getContext();
    const current = await db.query.delivery.findFirst({
        where: and(eq(delivery.id, deliveryId), ...(context.isAdmin ? [] : [eq(delivery.userId, context.uid)])),
    });
    if (!current) {
        return notFound();
    }
    if (addressId) {
        const data = await db.query.address.findFirst({
            where: and(
                eq(address_.id, addressId),
                ...(context.isAdmin ? [] : [eq(address_.userId, context.uid)])
            ),
        });
        if (data) {
            recipient = data.recipient;
            phone = data.phone;
            address = data.address;
        }
    }
    if (save && recipient && phone && address) {
        const addresses = await db.query.address.findMany({
            where: eq(address_.userId, current.userId),
            orderBy: [asc(address_.id)],
        });
        if (addresses.length > 3) {
            const list = addresses.slice(0, addresses.length - 2).map((i) => i.id);
            await db.delete(address_).where(inArray(address_.id, list));
        }
        await db
            .insert(address_)
            .values({
                userId: current.userId,
                recipient,
                phone,
                address,
            })
            .onConflictDoNothing({
                target: [address_.userId, address_.recipient, address_.phone, address_.address],
            });
    }
    await db
        .update(delivery)
        .set({
            phone,
            address,
            company,
            recipient: recipient!,
            comment: context.isAdmin ? comment : undefined,
        })
        .where(and(eq(delivery.id, deliveryId), ...(context.isAdmin ? [] : [eq(delivery.userId, context.uid)])));
};

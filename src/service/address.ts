"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/service/db";
import { Address } from "@/service/db/schema";
import { addressCreateSchema, addressUpdateSchema } from "@/type/address";
import { getContext } from "@/util/context";

export const getAddresses = async () => {
    const context = await getContext();
    return db.query.Address.findMany({
        where: eq(Address.userId, context.uid!),
        orderBy: [desc(Address.id)],
    });
};

export const createAddress = async (params: z.input<typeof addressCreateSchema>) => {
    const context = await getContext();
    const data = addressCreateSchema.parse(params);
    const created = await db
        .insert(Address)
        .values({ userId: context.uid!, ...data })
        .onConflictDoNothing({ target: [Address.userId, Address.recipient, Address.phone, Address.address] })
        .returning({ id: Address.id });
    if (created.length === 0) {
        throw new Error("该地址已存在");
    }
    revalidatePath("/addresses");
};

export const updateAddress = async (params: z.input<typeof addressUpdateSchema>) => {
    const context = await getContext();
    const { id, ...data } = addressUpdateSchema.parse(params);
    const updated = await db
        .update(Address)
        .set(data)
        .where(and(eq(Address.id, id), eq(Address.userId, context.uid!)))
        .returning({ id: Address.id });
    if (updated.length === 0) {
        throw new Error("地址不存在");
    }
    revalidatePath("/addresses");
};

export const removeAddress = async (params: number) => {
    const context = await getContext();
    const id = z.int().positive().parse(params);
    const removed = await db
        .delete(Address)
        .where(and(eq(Address.id, id), eq(Address.userId, context.uid!)))
        .returning({ id: Address.id });
    if (removed.length === 0) {
        throw new Error("地址不存在");
    }
    revalidatePath("/addresses");
};

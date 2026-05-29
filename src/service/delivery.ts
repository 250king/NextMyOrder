"use server";

import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { parseAddress } from "@/service/client/amap";
import { cancelOrder, createOrder } from "@/service/client/kd100";
import { db } from "@/service/db";
import { Address, Delivery, DeliveryToOrder, TicketLink } from "@/service/db/schema";
import { deliveryDetailSchema } from "@/type/delivery";
import { getContext } from "@/util/context";
import { randomStr } from "@/util/cover";
import { env } from "@/util/env";

const getDelivery = async (deliveryId: number) => {
    const context = await getContext();
    if (!context.isAdmin) {
        throw new Error("非管理员无权限");
    }
    const delivery = await db.query.Delivery.findFirst({
        where: eq(Delivery.id, deliveryId),
    });
    if (!delivery) {
        throw new Error("运单不存在");
    }
    return delivery;
}

export const getAddresses = async (params: number) => {
    const context = await getContext();
    const id = z.int().positive().parse(params);
    const delivery = await db.query.Delivery.findFirst({
        where: and(eq(Delivery.id, id), ...(context.isAdmin ? [] : [eq(Delivery.userId, context.uid!)])),
    });
    if (!delivery) {
        throw new Error("运单不存在");
    }
    return db.query.Address.findMany({
        where: eq(Address.userId, delivery.userId),
    });
};

export const getSenderAddresses = async () => {
    const context = await getContext();
    return db.query.Address.findMany({
        where: eq(Address.userId, context.uid!),
    });
};

export const saveDelivery = async (params: z.infer<typeof deliveryDetailSchema>) => {
    const data = deliveryDetailSchema.parse(params);
    const { addressId, comment, save, company, deliveryId } = data;
    let { recipient, phone, address } = data;
    const context = await getContext();
    const delivery = await db.query.Delivery.findFirst({
        where: and(eq(Delivery.id, deliveryId), ...(context.isAdmin ? [] : [eq(Delivery.userId, context.uid!)])),
    });
    if (!delivery) {
        throw new Error("运单不存在");
    }
    if (addressId) {
        const receiver = await db.query.Address.findFirst({
            where: and(eq(Address.id, addressId), ...(context.isAdmin ? [] : [eq(Address.userId, context.uid!)])),
        });
        if (receiver) {
            recipient = receiver.recipient;
            phone = receiver.phone;
            address = receiver.address;
        }
    }
    if (save && recipient && phone && address) {
        const addresses = await db.query.Address.findMany({
            where: eq(Address.userId, delivery.userId),
            orderBy: [asc(Address.id)],
        });
        if (addresses.length > 3) {
            const list = addresses.slice(0, addresses.length - 2).map((i) => i.id);
            await db.delete(Address).where(inArray(Address.id, list));
        }
        await db
            .insert(Address)
            .values({
                userId: delivery.userId,
                recipient,
                phone,
                address,
            })
            .onConflictDoNothing({
                target: [Address.userId, Address.recipient, Address.phone, Address.address],
            });
    }
    await db
        .update(Delivery)
        .set({
            phone,
            address,
            company,
            recipient: recipient!,
            comment: context.isAdmin ? comment : undefined,
        })
        .where(and(eq(Delivery.id, deliveryId), ...(context.isAdmin ? [] : [eq(Delivery.userId, context.uid!)])));
};

export const pushDelivery = async (p1: number, p2: number) => {
    const context = await getContext();
    if (!context.isAdmin) {
        throw new Error("非管理员无权限");
    }
    const deliveryId = z.int().positive().parse(p1);
    const addressId = z.int().positive().parse(p2);
    const delivery = await db.query.Delivery.findFirst({
        where: eq(Delivery.id, deliveryId),
    });
    const sender = await db.query.Address.findFirst({
        where: and(eq(Address.id, addressId)),
    });
    if (!delivery || !sender) {
        throw new Error("运单不存在");
    }
    if (!delivery.phone || !delivery.address || !delivery.recipient) {
        throw new Error("请完善运单信息");
    }
    let company;
    switch (delivery.company) {
        case "SF":
            company = "shunfeng";
            break;
        case "EMS":
            company = "ems";
            break;
        case "YTO":
            company = "yuantong";
            break;
        case "ZTO":
            company = "zhongtong";
            break;
        case "JD":
            company = "jd";
            break;
        default:
            throw new Error("该快递公司暂时不受支持");
    }
    const res = await createOrder({
        kuaidicom: company,
        sendManPrintAddr: sender.address,
        sendManName: sender.recipient,
        sendManMobile: sender.phone,
        recManPrintAddr: delivery.address,
        recManName: delivery.recipient,
        recManMobile: delivery.phone,
    });
    if (!res.data.result) {
        throw new Error(`推送失败：${res.data.message}`);
    }
    await db
        .update(Delivery)
        .set({
            status: "PUSHED",
            taskId: res.data.data.taskId,
            ticketId: res.data.data.orderId,
            ticketNum: res.data.data.kuaidinum || null,
            queryToken: res.data.data.pollToken || null,
        })
        .where(eq(Delivery.id, deliveryId));
};

export const withdrawDelivery = async (params: number, reason: string) => {
    const deliveryId = z.int().positive().parse(params);
    const delivery = await getDelivery(deliveryId);
    if (delivery.status != "PUSHED") {
        throw new Error("当前订单无法撤销");
    }
    await cancelOrder({
        taskId: delivery.taskId!,
        orderId: delivery.ticketId!,
        cancelMsg: reason,
    });
    await db
        .update(Delivery)
        .set({
            status: "PENDING",
            taskId: null,
            ticketId: null,
            ticketNum: null,
        })
        .where(eq(Delivery.id, deliveryId));
};

export const removeDelivery = async (params: number) => {
    const deliveryId = z.int().positive().parse(params);
    const delivery = await getDelivery(deliveryId);
    if (delivery.status != "PENDING") {
        throw new Error("当前运单无法删除");
    }
    await db.delete(DeliveryToOrder).where(eq(DeliveryToOrder.deliveryId, deliveryId));
    await db.delete(TicketLink).where(eq(TicketLink.deliveryId, deliveryId));
    await db.delete(Delivery).where(eq(Delivery.id, deliveryId));
};

export const generateQrCode = async (params: number) => {
    const deliveryId = z.int().positive().parse(params);
    const delivery = await getDelivery(deliveryId);
    if (delivery.status == "DELIVERED") {
        throw new Error("当前运单已发出");
    }
    if (!delivery.phone || !delivery.address || !delivery.recipient) {
        throw new Error("请完善运单信息");
    }
    const code = randomStr(8);
    const result = await parseAddress(delivery.address);
    await db.insert(TicketLink).values([
        {
            code,
            deliveryId: deliveryId,
        },
    ]);
    return {
        url: new URL(`/ticket/${code}`, env.BASE_URL).toString(),
        city: result.data?.geocodes?.[0]?.city || null,
    };
};

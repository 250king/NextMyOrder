import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/service/db";
import { Delivery, TicketLink } from "@/service/db/schema";
import { env } from "@/util/env";

const warningPattern = /\n?快递状态异常，请重点关注[:：]?\s*.+/;

const normalizeComment = (comment: string | null) => {
    const next = comment?.trim();
    return next ? next : null;
};

const removeWarning = (comment: string | null) => {
    return normalizeComment(comment?.replace(warningPattern, "") ?? null);
};

const addComment = (comment: string | null, line: string, pattern: RegExp) => {
    const current = normalizeComment(comment);
    if (!current) {
        return line;
    }
    return pattern.test(current) ? current.replace(pattern, line).trim() : `${current}\n${line}`;
};

export const POST = async (req: NextRequest) => {
    try {
        const query = await req.formData();
        const str = query.get("param") + env.KD100_NONCE;
        const sign = createHash("md5").update(str).digest("hex").toUpperCase();
        if (sign !== query.get("sign")) {
            return Response.json({ result: false, returnCode: "403", message: "Invalid signature" }, { status: 403 });
        }
        const delivery = await db.query.Delivery.findFirst({
            where: eq(Delivery.taskId, query.get("taskId") as string),
        });
        if (!delivery) {
            return Response.json({ result: false, returnCode: "400", message: "Delivery not found" }, { status: 404 });
        }
        const data = JSON.parse(query.get("param") as string);
        let status = delivery.status;
        let comment = delivery.comment;
        switch (Number(data.data.status)) {
            case 0:
            case 1:
            case 2:
            case 200:
                status = "PUSHED";
                comment = removeWarning(comment);
                break;
            case 10:
            case 15:
            case 101:
            case 400:
                status = "DELIVERED";
                comment = removeWarning(comment);
                break;
            case 13:
                status = "ARRIVED";
                comment = removeWarning(comment);
                await db.delete(TicketLink).where(eq(TicketLink.deliveryId, delivery.id));
                break;
            case 99:
                status = "PENDING"
                comment = addComment(comment, `订单已重置：${data.data.status}`, warningPattern);
                break;
            default:
                comment = addComment(comment, `快递状态异常，请重点关注：${data.data.status}`, warningPattern);
                break;
        }
        if (data.data.pickupCode) {
            const pattern = /取件码为[:：]?\s*\d+/;
            comment = addComment(comment, `取件码为${data.data.pickupCode}`, pattern);
        }
        await db
            .update(Delivery)
            .set({
                status,
                comment: normalizeComment(comment),
                ticketNum: data.kuaidinum || undefined,
                queryToken: data.data.pollToken || undefined,
            })
            .where(eq(Delivery.id, delivery.id));
        return Response.json({
            result: true,
            returnCode: "200",
            message: "ok",
        });
    } catch {
        return Response.json({
            result: false,
            returnCode: "400",
            message: "Bad request",
        })
    }
};

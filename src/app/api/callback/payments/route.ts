import { createHash } from "crypto";
import { notFound } from "next/navigation";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/service/db";
import { payment } from "@/service/db/schema";
import { queryResult } from "@/service/jdpay";
import { PaymentMethod } from "@/type/payment";
import { env } from "@/util/env";

export const GET = async (req: NextRequest) => {
    const sign = req.headers.get("token");
    const timestamp = req.headers.get("timestamp");
    const str = `secretKey=${env.JD_SECRET}&timestamp=${timestamp}`;
    const hash = createHash("sha1").update(str).digest("hex").toUpperCase();
    if (hash !== sign) {
        throw new Error("Invalid signature");
    }
    const requestId = req.nextUrl.searchParams.get("requestId") || "";
    const data = await db.query.payment.findFirst({
        where: eq(payment.requestId, requestId),
    })
    if (!data) {
        return notFound()
    }
    const result = await queryResult(requestId);
    let method: PaymentMethod;
    switch (result.data.payWayEnum) {
        case "GUOTONG_PAY_ALIPAY":
        case "GUOTONG_PAY_ALIPAY_SCAN":
            method = "ALIPAY"
            break;
        case "GUOTONG_PAY_WX":
        case "GUOTONG_PAY_WX_SCAN":
            method = "WECHAT";
            break;
        case "GUOTONG_PAY_UNIONPAY":
        case "GUOTONG_PAY_UNIONPAY_SCAN":
            method = "UNIONPAY";
            break;
        case "GUOTONG_PAY_JD":
        case "GUOTONG_PAY_JD_SCAN":
            method = "JDPAY";
            break;
        default:
            method = "CASH"
            break;
    }
    await db.update(payment).set({
        paidAt: result.data.data.completeTime,
        method: method,
    });
};
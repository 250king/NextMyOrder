import { createHash } from "crypto";
import { NextRequest } from "next/server";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { queryResult } from "@/service/client/jdpay";
import { db } from "@/service/db";
import { Payment } from "@/service/db/schema";
import { PaymentMethod } from "@/type/payment";
import { env } from "@/util/env";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const GET = async (req: NextRequest) => {
    const sign = req.headers.get("token");
    const timestamp = req.headers.get("timestamp");
    const str = `secretKey=${env.JD_SECRET}&timestamp=${timestamp}`;
    const hash = createHash("sha1").update(str).digest("hex").toUpperCase();
    if (hash !== sign) {
        return Response.json({ error: "invalid sign" }, { status: 403 });
    }
    const requestId = req.nextUrl.searchParams.get("requestNum") || "";
    const payment = await db.query.Payment.findFirst({
        where: eq(Payment.requestId, requestId),
    })
    if (!payment) {
        return Response.json({ error: "payment not found" }, { status: 404 });
    }
    const result = await queryResult(requestId);
    let method: PaymentMethod;
    switch (result.data.data.payWayEnum) {
        case "GUOTONG_PAY_ALIPAY":
        case "GUOTONG_PAY_ALIPAY_SCAN":
            method = "ALIPAY";
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
            method = "CASH";
            break;
    }
    await db.update(Payment).set({
        paidAt: dayjs.tz(result.data.data.completeTime, "YYYY-MM-DD HH:mm:ss", "Asia/Shanghai").toDate(),
        method: method,
    }).where(eq(Payment.id, payment.id));

    return new Response(null, { status: 204 });
};

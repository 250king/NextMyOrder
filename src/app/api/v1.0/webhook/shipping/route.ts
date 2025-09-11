import crypto from "crypto";
import {NextRequest, NextResponse} from "next/server";
import prisma from "@/util/data/database";

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();
        const sign = request.headers.get("sign") || "";
        const expectedSign = crypto.createHash("sha256")
            .update(JSON.stringify(body) + "/" + process.env.TRACKING_KEY!)
            .digest("hex");
        if (sign !== expectedSign) {
            return NextResponse.json({
                message: "签名验证失败",
            }, {
                status: 401,
            });
        }
        const shipping = await prisma.shipping.findUnique({
            where: {
                expressNumber: body.data.number,
            },
            include: {
                items: true,
            },
        });
        if (!shipping) {
            return NextResponse.json({
                message: "未找到对应的物流记录",
            }, {
                status: 404,
            });
        }
        let status: string;
        if (body.event === "TRACKING_UPDATED") {
            switch (body.data.track_info.latest_status.status) {
                case "InfoReceived":
                    status = "pending";
                    break;
                case "InTransit":
                case "OutForDelivery":
                case "AvailableForPickup":
                    status = "confirmed";
                    break;
                case "Delivered":
                    status = "finished";
                    break;
                case "DeliveryFailure":
                    status = "failed";
                    break;
                default:
                    status = "warning";
                    break;
            }
        } else {
            status = "warning";
        }
        const detail = body.data.track_info.latest_status.sub_status_descr? `\n${body.data.track_info.latest_status.sub_status_descr}` : "";
        await prisma.shipping.update({
            where: {
                id: shipping.id,
            },
            data: {
                status: status,
                comment: `${body.data.track_info.latest_status.sub_status}${detail}`,
            },
        });
        return NextResponse.json({
            message: "处理成功",
        });
    } catch (error) {
        console.error("Webhook处理错误:", error);
        return NextResponse.json({
            message: "处理失败",
        }, {
            status: 500,
        });
    }
};

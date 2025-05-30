import {NextRequest, NextResponse} from "next/server";
import crypto from "crypto";
import database from "@/util/database";

export async function POST(request: NextRequest) {
    try {
        const body = await request.formData();
        const param = body.get("param") || "";
        const sign = body.get("sign") || "";
        const expectedSign = crypto.createHash("md5")
            .update(param + process.env.APP_KEY!)
            .digest("hex")
            .toUpperCase();
        if (sign !== expectedSign) {
            return NextResponse.json({
                result: false,
                returnCode: "500",
                message: "签名验证失败"
            }, {
                status: 401
            });
        }
        const delivery = await database.delivery.findUnique({
            where: {
                taskId: body.get("taskId")!.toString(),
            },
            include: {
                orders: {
                    include: {
                        item: true,
                    }
                }
            }
        });
        if (!delivery) {
            return NextResponse.json({
                result: false,
                returnCode: "404",
                message: "未找到对应的快递记录"
            }, {
                status: 404
            });
        }
        const payload = JSON.parse(param.toString());
        const data: Record<string, unknown> = {};
        data.comment = payload.message;
        if (payload.kuaidinum) {
            data.expressNumber = payload.kuaidinum;
        }
        if (payload.data.orderId) {
            data.expressId = payload.data.orderId;
        }
        if (payload.data.pollToken) {
            data.token = payload.data.pollToken;
        }
        switch (payload.data.status) {
            case 0:
            case 1:
            case 2:
                data.status = "waiting";
                break;
            case 10:
            case 101:
            case 200:
            case 166:
            case 400:
                data.status = "confirmed";
                break;
            case 13:
                data.status = "finished";
                await database.order.updateMany({
                    where: {
                        deliveryId: delivery.id
                    },
                    data: {
                        status: "finished"
                    }
                });
                for (const order of delivery.orders) {
                    if (await database.order.count({
                        where: {
                            item: {
                                groupId: order.item.groupId
                            },
                            status: {
                                notIn: ["finished", "failed"]
                            }
                        }
                    }) == 0) {
                        await database.group.update({
                            where: {
                                id: order.item.groupId
                            },
                            data: {
                                status: "finished"
                            }
                        })
                    }
                }
                break;
            case 11:
            case 12:
            case 14:
            case 201:
            case 155:
                data.status = "warning";
                break;
            default:
                data.status = "failed";
                break;
        }
        await database.delivery.update({
            data,
            where: {
                id: delivery.id
            },
        });
        return NextResponse.json({
            result: true,
            returnCode: "200",
            message: "处理成功"
        });
    } catch (error) {
        console.error("Webhook处理错误:", error);
        return NextResponse.json({
            result: false,
            returnCode: "500",
            message: "处理失败"
        }, {
            status: 500
        });
    }
}

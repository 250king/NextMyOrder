import database from "@repo/util/data/database";
import crypto from "crypto";
import {NextRequest, NextResponse} from "next/server";

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.formData();
        const param = body.get("param") || "";
        const sign = body.get("sign") || "";
        const expectedSign = crypto.createHash("md5")
            .update(param + process.env.EXPRESS_KEY!)
            .digest("hex")
            .toUpperCase();
        if (sign !== expectedSign) {
            return NextResponse.json({
                message: "签名验证失败",
            }, {
                status: 401,
            });
        }
        const delivery = await database.delivery.findUnique({
            where: {
                taskId: body.get("taskId")!.toString(),
            },
            include: {
                orders: {
                    include: {
                        order: true,
                    },
                },
            },
        });
        if (!delivery) {
            return NextResponse.json({
                message: "未找到对应的快递记录",
            }, {
                status: 404,
            });
        }
        const payload = JSON.parse(param.toString());
        const data: Record<string, unknown> = {};
        data.comment = payload.data.status;
        data.expressNumber = payload.kuaidinum ?? delivery.expressNumber;
        data.expressId = payload.data.orderId ?? delivery.expressId;
        data.token = payload.data.pollToken ?? delivery.queryToken;
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
                await database.delivery.update({
                    where: {
                        id: delivery.id,
                    },
                    data: {
                        status: "finished",
                    },
                });
                for (const order of delivery.orders) {
                    await database.order.updateMany({
                        where: {
                            id: order.orderId,
                            deliveries: {
                                every: {
                                    delivery: {
                                        status: "finished",
                                    },
                                },
                            },
                        },
                        data: {
                            status: "finished",
                        },
                    });
                }
                break;
            case 9:
            case 99:
            case 610:
                data.status = "failed";
                break;
            default:
                data.status = "warning";
                break;
        }
        await database.delivery.update({
            data,
            where: {
                id: delivery.id,
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

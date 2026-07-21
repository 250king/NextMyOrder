import React from "react";
import { notFound } from "next/navigation";
import { Alert, Surface } from "@heroui/react";
import { eq } from "drizzle-orm";
import { parseAddress } from "@/service/client/amap";
import { db } from "@/service/db";
import { TicketLink } from "@/service/db/schema";
import { companyMap } from "@/type/delivery";

type PageProps = {
    params: Promise<{
        code: string;
    }>;
};

const maskName = (name: string) => {
    if (name.length <= 1) {
        return name;
    }
    if (name.length === 2) {
        return `${name[0]}*`;
    }
    return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
};

const Page = async ({ params }: PageProps) => {
    const data = await params;
    const delivery = await db.query.TicketLink.findFirst({
        where: eq(TicketLink.code, data.code),
        with: {
            delivery: {
                columns: {
                    id: true,
                    recipient: true,
                    phone: true,
                    address: true,
                    company: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    comment: true,
                    ticketNum: true,
                },
            },
        },
    });
    if (!delivery) {
        return notFound();
    }
    const result = delivery.delivery;
    const parsed = await parseAddress(result.address!);
    const current = parsed.data?.geocodes?.[0];
    const maskedRecipient = maskName(result.recipient);
    const maskedPhone = result.phone?.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") || "-";
    const maskedAddress = current
        ? current.province === current.city
            ? current.city
            : `${current.province}${current.city}`
        : "-";

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <header className="flex flex-col gap-3">
                    <h1 className="text-2xl font-bold">运单详情</h1>
                </header>
                <Alert status="warning">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>致各个快递小哥</Alert.Title>
                        <Alert.Description>用户信息安全性不容忽视，提供的信息仅供确认使用，不得用于二手贩卖。如有违反规定使用，将依据访问记录进行追究责任</Alert.Description>
                    </Alert.Content>
                </Alert>
                <Surface className="rounded-3xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-base font-semibold">基础信息</h2>
                    </div>
                    <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                        <div className="min-w-0">
                            <div className="text-muted">收件人</div>
                            <div className="truncate font-medium">{maskedRecipient}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">手机</div>
                            <div className="truncate font-medium">{maskedPhone}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">目标城市</div>
                            <div className="font-medium">{maskedAddress}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">快递公司</div>
                            <div className="font-medium">
                                {result.company ? companyMap[result.company] : "-"}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">快递单号</div>
                            <div className="font-medium">{result.ticketNum || "-"}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">备注</div>
                            <div className="font-medium">{result.comment || "-"}</div>
                        </div>
                    </div>
                </Surface>
            </div>
        </div>
    );
};

export default Page;

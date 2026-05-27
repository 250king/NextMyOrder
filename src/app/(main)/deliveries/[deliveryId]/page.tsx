import React from "react";
import { Alert, ButtonGroup, Chip, Surface } from "@heroui/react";
import { and, eq } from "drizzle-orm";
import notFound from "@/app/not-found";
import { DeliveryModal } from "@/component/modal/delivery";
import { DeliveryTab } from "@/component/tab/delivery";
import { db } from "@/service/db";
import { Delivery } from "@/service/db/schema";
import { colorMap, companyMap, iconMap, statusMap } from "@/type/delivery";
import { getContext } from "@/util/context";
import { date } from "@/util/cover";

type PageProps = {
    params: Promise<{
        deliveryId: number;
    }>;
    searchParams: Promise<{
        tab?: string;
    }>;
};

const Page = async ({ params, searchParams }: PageProps) => {
    const query = await params;
    const search = await searchParams;
    const context = await getContext();
    const data = await db.query.Delivery.findFirst({
        where: and(
            eq(Delivery.id, query.deliveryId),
            ...(context.isAdmin ? [] : [eq(Delivery.userId, context.uid!)])
        ),
    });
    if (!data) {
        return notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <header className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-bold">分发管理 #{data.id}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {data.ticketNum && (
                            <Chip variant="primary">
                                <span className={iconMap[data.company!]} />
                                <Chip.Label>{companyMap[data.company!]}</Chip.Label>
                            </Chip>
                        )}
                        <Chip variant="primary" color={colorMap[data.status]}>
                            {statusMap[data.status]}
                        </Chip>
                    </div>
                </header>
                {(!data.address || !data.recipient || !data.phone) && (
                    <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>部分收件人信息不完善</Alert.Title>
                            <Alert.Description>请尽快完善收件人信息，否则商品无法发出</Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}
                <Surface className="rounded-3xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-base font-semibold">基础信息</h2>
                        <ButtonGroup>
                            <DeliveryModal data={data} isAdmin={context.isAdmin} />
                        </ButtonGroup>
                    </div>
                    <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                        <div className="min-w-0">
                            <div className="text-muted">收件人</div>
                            <div className="truncate font-medium">{data.recipient || "-"}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">手机</div>
                            <div className="truncate font-medium">{data.phone || "-"}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">地址</div>
                            <div className="font-medium">{data.address || "-"}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">快递公司</div>
                            <div className="font-medium">{data.company ? companyMap[data.company] : "-"}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">快递单号</div>
                            <div className="font-medium">{data.ticketNum || "-"}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">备注</div>
                            <div className="font-medium">{data.comment || "-"}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">创建时间</div>
                            <div className="font-medium">{date(data.createdAt)}</div>
                        </div>

                        <div className="min-w-0">
                            <div className="text-muted">更新时间</div>
                            <div className="font-medium">{date(data.updatedAt)}</div>
                        </div>
                    </div>
                </Surface>
                <DeliveryTab data={data} search={search} />
            </div>
        </div>
    );
};

export default Page;

import React from "react";
import { notFound } from "next/navigation";
import { Alert, Chip, Surface, Tabs } from "@heroui/react";
import { and, eq } from "drizzle-orm";
import { GoodsGard } from "@/component/card/delivery";
import { LinkTab } from "@/component/common/tab";
import { DeliveryModifyModal } from "@/component/modal/delivery";
import { db } from "@/service/db";
import { Delivery, DeliveryToOrder } from "@/service/db/schema";
import { PanelProps, Query } from "@/type/common";
import { colorMap, companyMap, DeliveryResult, iconMap, statusMap } from "@/type/delivery";
import { getContext } from "@/util/context";
import { date, toPagination } from "@/util/cover";

type PageProps = {
    params: Promise<{ deliveryId: number }>;
    searchParams: Promise<Query & { tab?: string }>;
};

const GoodsPanel = async ({ data, ...query }: PanelProps<DeliveryResult> & Query) => {
    const pagination = toPagination(query);
    const [items, total] = await Promise.all([
        db.query.DeliveryToOrder.findMany({
            where: eq(DeliveryToOrder.deliveryId, data.id),
            with: {
                order: {
                    with: {
                        user: true,
                        transit: true,
                        item: { with: { group: true } },
                    },
                },
            },
            ...pagination,
        }),
        db.$count(DeliveryToOrder, eq(DeliveryToOrder.deliveryId, data.id)),
    ]);

    return <GoodsGard items={items.map((i) => i.order)} total={total} data={data} />;
};

const Page = async ({ params, searchParams }: PageProps) => {
    const path = await params;
    const search = await searchParams;
    const currentTab = search.tab === "track" ? "track" : "order";
    const context = await getContext();
    const data = await db.query.Delivery.findFirst({
        where: and(eq(Delivery.id, path.deliveryId), eq(Delivery.userId, context.uid!)),
        with: { user: true },
    });
    if (!data) {
        return notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <header className="flex flex-col gap-3">
                    <h1 className="text-2xl font-bold">分发 #{data.id}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        {data.company && (
                            <Chip variant="primary">
                                <span className={iconMap[data.company]} />
                                <Chip.Label>{companyMap[data.company]}</Chip.Label>
                            </Chip>
                        )}
                        <Chip variant="primary" color={colorMap[data.status]}>{statusMap[data.status]}</Chip>
                    </div>
                </header>
                {(!data.address || !data.recipient || !data.phone) && (
                    <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>收件信息尚未完善</Alert.Title>
                            <Alert.Description>请从地址簿选择收件地址，否则商品无法发出。</Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}
                <Surface className="rounded-3xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-base font-semibold">基础信息</h2>
                        {data.status === "PENDING" && <DeliveryModifyModal data={data} />}
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
                <Tabs selectedKey={currentTab} className="w-full gap-4">
                    <Tabs.ListContainer className="w-fit max-w-full">
                        <Tabs.List className="w-fit max-w-full *:w-fit *:whitespace-nowrap">
                            <LinkTab href={`/deliveries/${data.id}?tab=order`} id="order">
                                已绑定商品
                                <Tabs.Indicator />
                            </LinkTab>
                            <LinkTab href={`/deliveries/${data.id}?tab=track`} id="track">
                                物流跟踪
                                <Tabs.Indicator />
                            </LinkTab>
                        </Tabs.List>
                    </Tabs.ListContainer>
                    <div className="w-full">
                        <Tabs.Panel className="p-0" id="order">
                            <GoodsPanel data={data} userId={context.uid!} {...search} />
                        </Tabs.Panel>
                        <Tabs.Panel className="p-0" id="track">
                            <div className="min-h-48 rounded-lg border border-dashed border-separator p-6" />
                        </Tabs.Panel>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default Page;

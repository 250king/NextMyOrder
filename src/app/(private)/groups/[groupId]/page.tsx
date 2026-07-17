import React from "react";
import { notFound } from "next/navigation";
import { Alert, Chip, Surface, Tabs } from "@heroui/react";
import { and, count, eq, exists, getTableColumns, isNotNull, SQL, sql } from "drizzle-orm";
import { BuyCard, TransitCard } from "@/component/card/group";
import { LinkTab } from "@/component/common/tab";
import { db } from "@/service/db";
import { Group, Item, List, Order, Transit } from "@/service/db/schema";
import { PanelProps, Query } from "@/type/common";
import { colorMap, GroupResult, statusMap } from "@/type/group";
import type { OrderStatus } from "@/type/order";
import { getContext } from "@/util/context";
import { date, toPagination } from "@/util/cover";

type PageProps = {
    params: Promise<{
        groupId: number;
    }>;
    searchParams: Promise<{
        tab?: string;
    }>;
};

const BuyPanel = async ({ data, userId, ...query }: PanelProps<GroupResult> & Query) => {
    const pagination = toPagination(query);
    const filters: SQL[] = [eq(Item.groupId, data.id)];
    if (data.status !== "PENDING") {
        filters.push(isNotNull(Order.id));
    }
    const orderJoin = and(eq(Order.itemId, Item.id), eq(Order.userId, userId));
    const [items, [total]] = await Promise.all([
        db
            .select({
                ...getTableColumns(Item),
                selected: sql<number>`
                    coalesce(${Order.count}, 0)
                `.mapWith(Number),
                status: sql<OrderStatus>`
                    coalesce(${Order.status}, 'PENDING'::"OrderStatus")
                `,
                orderId: sql<number>`
                    coalesce(${Order.id}, NULL)
                `
            })
            .from(Item)
            .leftJoin(Order, orderJoin)
            .where(and(...filters))
            .limit(pagination.limit)
            .offset(pagination.offset),
        db
            .select({
                total: count(Item.id),
            })
            .from(Item)
            .leftJoin(Order, orderJoin)
            .where(and(...filters)),
    ]);

    return <BuyCard items={items} total={total.total} data={data} {...query} />;
};

const TransitPanel = async ({ data, userId, ...query }: PanelProps<GroupResult> & Query) => {
    const pagination = toPagination(query);
    const hasCurrentUserOrder = exists(
        db
            .select({
                id: Order.id,
            })
            .from(Order)
            .innerJoin(Item, eq(Item.id, Order.itemId))
            .where(and(eq(Order.transitId, Transit.id), eq(Order.userId, userId), eq(Item.groupId, data.id)))
    );
    const [items, total] = await Promise.all([
        db.select().from(Transit).where(hasCurrentUserOrder).limit(pagination.limit).offset(pagination.offset),
        db.$count(Transit, hasCurrentUserOrder),
    ]);

    return <TransitCard items={items} total={total} data={data} {...query} />;
};

const Page = async ({ params, searchParams }: PageProps) => {
    const path = await params;
    const search = await searchParams;
    const context = await getContext();
    const sql = exists(
        db
            .select()
            .from(List)
            .where(and(eq(List.groupId, Group.id), eq(List.userId, context.uid!)))
    );
    const currentTab = search.tab === "track" ? "track" : "buy";
    const data = await db.query.Group.findFirst({
        where: and(eq(Group.id, path.groupId), ...(context.isAdmin ? [] : [sql])),
    });
    if (!data) {
        notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <header className="flex flex-col gap-3">
                    <h1 className="text-2xl font-bold">{data.name}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <Chip className="shrink-0" variant="primary" color={colorMap[data.status]}>
                            {statusMap[data.status]}
                        </Chip>
                    </div>
                </header>
                {data.status == "PENDING" && (
                    <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>团购截止时间为 {date(data.deadline)}</Alert.Title>
                            <Alert.Description>请在截止时间前完成选购，过后将无法进行选购操作。</Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}
                <Surface className="rounded-3xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-base font-semibold">基础信息</h2>
                    </div>
                    <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                        <div className="min-w-0">
                            <div className="text-muted">群号</div>
                            <div className="font-medium">{data.qq}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">截至时间</div>
                            <div className="font-medium">{date(data.deadline)}</div>
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
                            <LinkTab href={`/groups/${data.id}?tab=buy`} id="buy">
                                需求单
                                <Tabs.Indicator />
                            </LinkTab>
                            <LinkTab href={`/groups/${data.id}?tab=track`} id="track">
                                国际运单
                                <Tabs.Indicator />
                            </LinkTab>
                        </Tabs.List>
                    </Tabs.ListContainer>
                    <div className="w-full">
                        <Tabs.Panel className="p-0" id="buy">
                            <BuyPanel data={data} userId={context.uid!} {...search} />
                        </Tabs.Panel>
                        <Tabs.Panel className="p-0" id="track">
                            <TransitPanel data={data} userId={context.uid!} {...search} />
                        </Tabs.Panel>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default Page;

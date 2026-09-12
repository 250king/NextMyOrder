import React from "react";
import { notFound } from "next/navigation";
import { Alert, Chip, Surface, Tabs } from "@heroui/react";
import { and, count, eq, exists, getTableColumns, isNotNull, SQL, sql } from "drizzle-orm";
import { DemandCard, OrderCard, TransitCard } from "@/component/card/group";
import { LinkTab } from "@/component/common/tab";
import { GroupDemandFinalizeModal } from "@/component/modal/group";
import { db } from "@/service/db";
import { Demand, Group, Item, Member, Order, Transit } from "@/service/db/schema";
import { PanelProps, Query } from "@/type/common";
import { colorMap, GroupResult, statusMap } from "@/type/group";
import { getContext } from "@/util/context";
import { date, toPagination } from "@/util/cover";

type PageProps = {
    params: Promise<{
        groupId: number;
    }>;
    searchParams: Promise<
        Query & {
            tab?: string;
        }
    >;
};

const DemandPanel = async ({ data, userId, ...query }: PanelProps<GroupResult> & Query) => {
    const pagination = toPagination(query);
    const filters: SQL[] = [eq(Item.groupId, data.id)];
    const demandJoin = and(eq(Demand.itemId, Item.id), eq(Demand.userId, userId));

    if (data.status !== "PENDING") {
        filters.push(isNotNull(Demand.itemId));
    }

    const [items, [total]] = await Promise.all([
        db
            .select({
                ...getTableColumns(Item),
                selected: sql<number>`
                    coalesce(${Demand.count}, 0)
                `.mapWith(Number),
            })
            .from(Item)
            .leftJoin(Demand, demandJoin)
            .where(and(...filters))
            .limit(pagination.limit)
            .offset(pagination.offset),
        db
            .select({
                total: count(Item.id),
            })
            .from(Item)
            .leftJoin(Demand, demandJoin)
            .where(and(...filters)),
    ]);

    return <DemandCard items={items} total={total.total} data={data} {...query} />;
};

const OrderPanel = async ({ data, userId, ...query }: PanelProps<GroupResult> & Query) => {
    const pagination = toPagination(query);
    const belongsToGroup = exists(
        db
            .select({ id: Item.id })
            .from(Item)
            .where(and(eq(Item.id, Order.itemId), eq(Item.groupId, data.id)))
    );
    const filters = and(eq(Order.userId, userId), belongsToGroup);
    const [items, total] = await Promise.all([
        db.query.Order.findMany({
            where: filters,
            with: {
                item: true,
            },
            ...pagination,
        }),
        db.$count(Order, filters),
    ]);

    return <OrderCard items={items} total={total} {...query} />;
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
    const membership = exists(
        db
            .select()
            .from(Member)
            .where(and(eq(Member.groupId, Group.id), eq(Member.userId, context.uid!)))
    );
    const data = await db.query.Group.findFirst({
        where: and(eq(Group.id, path.groupId), ...(context.isAdmin ? [] : [membership])),
    });

    if (!data) {
        notFound();
    }

    const member = await db.query.Member.findFirst({
        where: and(eq(Member.groupId, data.id), eq(Member.userId, context.uid!)),
    });
    const isFinalized = Boolean(member?.finalizedAt);
    const canFinalize = data.status === "CLOSED" && Boolean(member) && !isFinalized;

    const currentTab =
        data.status === "PENDING" || !isFinalized
            ? "demand"
            : search.tab === "demand" || search.tab === "track"
              ? search.tab
              : "order";

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <header className="flex flex-col gap-3">
                    <h1 className="text-2xl font-bold">{data.name}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <Chip className="shrink-0" variant="primary" color={colorMap[data.status]}>
                            {statusMap[data.status]}
                        </Chip>
                        {data.status !== "PENDING" && member && (
                            <Chip variant="primary" color={isFinalized ? "success" : "warning"}>
                                {isFinalized ? "订单已生成" : "待确认需求"}
                            </Chip>
                        )}
                    </div>
                </header>

                {data.status === "PENDING" && (
                    <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>团购截止时间为 {date(data.deadline)}</Alert.Title>
                            <Alert.Description>截止前可以随时调整需求数量，截单后需求将被冻结。</Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}

                {canFinalize && (
                    <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>团购已截止，请确认最终需求</Alert.Title>
                            <Alert.Description>
                                当前需求已经冻结。确认后会生成正式订单，之后无法自行修改商品和数量。
                            </Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}

                <Surface className="rounded-3xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-base font-semibold">基础信息</h2>
                        {canFinalize && <GroupDemandFinalizeModal data={data} />}
                    </div>
                    <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                        <div className="min-w-0">
                            <div className="text-muted">群号</div>
                            <div className="font-medium">{data.qq}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">截止时间</div>
                            <div className="font-medium">{date(data.deadline)}</div>
                        </div>
                        {member && data.status !== "PENDING" && (
                            <div className="min-w-0">
                                <div className="text-muted">需求确认</div>
                                <div className="font-medium">
                                    {member.finalizedAt ? date(member.finalizedAt) : "尚未确认"}
                                </div>
                            </div>
                        )}
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
                    {data.status !== "PENDING" && isFinalized && (
                        <Tabs.ListContainer className="w-fit">
                            <Tabs.List className="w-fit max-w-full *:w-fit *:whitespace-nowrap">
                                <LinkTab href={`/groups/${data.id}?tab=demand`} id="demand">
                                    需求单
                                    <Tabs.Indicator />
                                </LinkTab>
                                <LinkTab href={`/groups/${data.id}?tab=order`} id="order">
                                    订单
                                    <Tabs.Indicator />
                                </LinkTab>
                                <LinkTab href={`/groups/${data.id}?tab=track`} id="track">
                                    国际运单
                                    <Tabs.Indicator />
                                </LinkTab>
                            </Tabs.List>
                        </Tabs.ListContainer>
                    )}
                    <div className="w-full">
                        <Tabs.Panel className="p-0" id="demand">
                            <DemandPanel data={data} userId={context.uid!} {...search} />
                        </Tabs.Panel>
                        {isFinalized && (
                            <Tabs.Panel className="p-0" id="order">
                                <OrderPanel data={data} userId={context.uid!} {...search} />
                            </Tabs.Panel>
                        )}
                        {isFinalized && (
                            <Tabs.Panel className="p-0" id="track">
                                <TransitPanel data={data} userId={context.uid!} {...search} />
                            </Tabs.Panel>
                        )}
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default Page;

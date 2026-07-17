"use client";
import React from "react";
import { Card, CheckboxGroup, Chip } from "@heroui/react";
import { EnumFilter, SearchFilter, useFilter } from "@/component/common/filter";
import { LinkButton } from "@/component/common/link";
import { ImagePreview } from "@/component/weight/image";
import { Loading } from "@/component/weight/loading";
import { Pagination } from "@/component/weight/pagination";
import { DataCardProps, Query } from "@/type/common";
import { colorMap, companyMap, DeliveryQuery, DeliveryResult, iconMap, statusMap } from "@/type/delivery";
import { OrderResult } from "@/type/order";
import { currency } from "@/util/cover";
import { useSelected } from "@/util/hook";

export const DeliveryCard = ({
    items,
    total,
    company,
    status,
    keyword,
    page,
}: DataCardProps<DeliveryQuery, DeliveryResult>) => {
    const [isPending, startTransition] = React.useTransition();
    const { updateFilter, updateLocalFilter } = useFilter(startTransition);
    const selected = useSelected();

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <SearchFilter
                key={keyword || ""}
                initialValue={keyword}
                onSearch={(val) => updateFilter({ keyword: val })}
            />
            <EnumFilter
                label="快递公司"
                currentValue={company}
                options={companyMap}
                onChange={(val) => updateFilter({ company: val })}
            />
            <EnumFilter
                label="订单状态"
                currentValue={status}
                options={statusMap}
                onChange={(val) => updateFilter({ status: val })}
            />
            <p className="text-default-500 text-sm">共找到{total}条记录</p>
            <CheckboxGroup
                value={selected}
                onChange={(val) => updateLocalFilter({ selected: val.length > 0 ? JSON.stringify(val) : null })}
            >
                <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <Card key={item.id} className="h-full min-w-0 transition-shadow hover:shadow-lg">
                            <Card.Header className="flex w-full flex-row items-start justify-between gap-3">
                                <div className="flex flex-row items-center gap-2">
                                    {(!item.address || !item.phone || !item.recipient) && (
                                        <Chip variant="primary" color="warning">
                                            物流信息未完善
                                        </Chip>
                                    )}
                                    {item.ticketNum && (
                                        <Chip variant="primary">
                                            <span className={iconMap[item.company!]} />
                                            <Chip.Label>{item.ticketNum}</Chip.Label>
                                        </Chip>
                                    )}
                                    <Chip variant="primary" color={colorMap[item.status]}>
                                        {statusMap[item.status]}
                                    </Chip>
                                </div>
                                <div className="flex flex-row gap-2 items-center">
                                    <span className="text-default-500 shrink-0 font-mono text-sm space-x-2">
                                        #{item.id}
                                    </span>
                                </div>
                            </Card.Header>
                            <Card.Content className="flex flex-1 flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="min-w-0">
                                        <Card.Title>{item.user.name}</Card.Title>
                                        <Card.Description>{item.user.qq}</Card.Description>
                                    </div>
                                </div>
                                <div className="text-default-500 text-sm">{item.address}</div>
                            </Card.Content>
                            <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                                <LinkButton href={`/deliveries/${item.id}`} variant="secondary">
                                    详情
                                </LinkButton>
                            </Card.Footer>
                        </Card>
                    ))}
                </div>
            </CheckboxGroup>
            <Pagination startTransition={startTransition} total={total} page={page} />
        </div>
    );
};

export const GoodsGard = ({
    items,
    total,
    page,
}: DataCardProps<Query, OrderResult> & {
    data: DeliveryResult;
}) => {
    const [isPending, startTransition] = React.useTransition();

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <p className="text-default-500 text-sm">共找到{total}条记录</p>
            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <Card
                        key={item.id}
                        className="h-full min-w-0 transition-shadow hover:shadow-lg w-full items-stretch flex-row"
                    >
                        <div className="relative shrink-0 overflow-hidden rounded-2xl h-30 w-30">
                            <ImagePreview
                                alt={item.item.name}
                                src={item.item.image || "https://static.250king.top/image/2026/04/i3f4xep2.png"}
                                className="pointer-events-none h-full w-full scale-125 object-cover select-none"
                            />
                        </div>
                        <div className="flex flex-1 flex-col gap-3 min-w-0">
                            <Card.Header className="min-w-0 flex-1">
                                <div className="min-w-0 flex-1">
                                    <Card.Title className="truncate">{item.item.name}</Card.Title>
                                    <div className="text-muted shrink-0 font-mono text-sm">
                                        #{item.id}
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Content className="flex flex-1 flex-col gap-2">
                                <div className="text-xl font-bold">
                                    {currency(item.item.price, "JPY")}
                                    <span className="px-1 align-baseline text-xs font-medium text-muted">
                                        × {item.count}
                                    </span>
                                </div>
                            </Card.Content>
                            <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                                <LinkButton href={`/groups/${item.item.groupId}?tab=order`} variant="secondary">
                                    详情
                                </LinkButton>
                            </Card.Footer>
                        </div>
                    </Card>
                ))}
            </div>
            <Pagination startTransition={startTransition} total={total} page={page} />
        </div>
    );
};

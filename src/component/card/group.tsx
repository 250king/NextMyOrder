"use client";
import React from "react";
import { Card, Chip, NumberField } from "@heroui/react";
import { EnumFilter, SearchFilter, useFilter } from "@/component/common/filter";
import { LinkButton } from "@/component/common/link";
import { CardImage, ImagePreview } from "@/component/weight/image";
import { Loading } from "@/component/weight/loading";
import { Pagination } from "@/component/weight/pagination";
import { DataCardProps, Query } from "@/type/common";
import { colorMap as groupColorMap, statusMap as groupStatusMap, GroupQuery, GroupResult } from "@/type/group";
import { ItemResult } from "@/type/item";
import { statusMap as orderStatusMap, colorMap as orderColorMap, type OrderStatus } from "@/type/order";
import {
    statusMap as transitStatusMap,
    colorMap as transitColorMap,
    iconMap,
    typeMap,
    TransitResult,
} from "@/type/transit";
import { currency } from "@/util/cover";

export const GroupCard = ({ items, total, status, page, keyword }: DataCardProps<GroupQuery, GroupResult>) => {
    const [isPending, startTransition] = React.useTransition();
    const { updateFilter } = useFilter(startTransition);

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <SearchFilter
                key={keyword || ""}
                initialValue={keyword}
                onSearch={(val) => updateFilter({ keyword: val })}
            />
            <EnumFilter
                label="团购状态"
                currentValue={status}
                options={groupStatusMap}
                onChange={(val) => updateFilter({ status: val })}
            />
            <p className="text-default-500 text-sm">共找到{total}条记录</p>
            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <Card
                        key={item.id}
                        className="h-full min-w-0 overflow-hidden p-0 transition-shadow hover:shadow-lg"
                    >
                        <CardImage src={item.image || "https://static.250king.top/image/2026/04/i3f4xep2.png"} />
                        <Card.Content className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                            <Card.Title className="truncate text-xl">{item.name}</Card.Title>
                            <div className="flex flex-row items-center gap-2">
                                <Chip variant="primary" color="accent">
                                    <span className="icon-[ri--qq-fill]" />
                                    <Chip.Label>{item.qq}</Chip.Label>
                                </Chip>
                                <Chip variant="primary" color={groupColorMap[item.status]}>
                                    {groupStatusMap[item.status]}
                                </Chip>
                            </div>
                        </Card.Content>
                        <Card.Footer className="mt-auto flex w-full justify-end gap-2 px-4 pb-4">
                            <LinkButton href={`/groups/${item.id}`} variant="secondary">
                                详情
                            </LinkButton>
                        </Card.Footer>
                    </Card>
                ))}
            </div>
            <Pagination startTransition={startTransition} total={total} page={page} />
        </div>
    );
};

export const BuyCard = ({
    data,
    items,
    total,
    page,
}: DataCardProps<Query, ItemResult & { selected: number; status: OrderStatus }> & { data: GroupResult }) => {
    const [isPending, startTransition] = React.useTransition();

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <p className="text-default-500 text-sm">共找到{total}条记录</p>
            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <Card
                        key={item.id}
                        className="h-full min-w-0 transition-shadow hover:shadow-lg w-full items-center flex-row"
                    >
                        <div className="relative shrink-0 overflow-hidden rounded-2xl h-30 w-30">
                            <ImagePreview
                                alt={item.name}
                                src={item.image || "https://static.250king.top/image/2026/04/i3f4xep2.png"}
                                className="pointer-events-none h-full w-full scale-125 object-cover select-none"
                            />
                        </div>
                        <div className="flex flex-1 flex-col gap-2 min-w-0">
                            <Card.Header className="min-w-0 flex-1">
                                <div className="min-w-0 flex-1 space-y-2">
                                    <Card.Title className="truncate">{item.name}</Card.Title>
                                    <div className="flex flex-row items-center justify-between gap-2">
                                        <Chip variant="primary" color={orderColorMap[item.status]}>
                                            {orderStatusMap[item.status]}
                                        </Chip>
                                        {item.orderId && (
                                            <div className="text-muted shrink-0 font-mono text-sm">#{item.orderId}</div>
                                        )}
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Content className="flex flex-1 flex-col gap-2">
                                <div className="text-xl font-bold">{currency(item.price, "JPY")}</div>
                            </Card.Content>
                            <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                                <LinkButton href={item.url} variant="secondary" isIconOnly>
                                    <span className="icon-[ri--external-link-line]" />
                                </LinkButton>
                                <NumberField
                                    variant="secondary"
                                    className="w-32"
                                    isDisabled={data.status !== "PENDING"}
                                    defaultValue={item.selected ?? 0}
                                    minValue={0}
                                    maxValue={99}
                                    formatOptions={{
                                        maximumFractionDigits: 0,
                                    }}
                                    name="count"
                                >
                                    <NumberField.Group>
                                        <NumberField.DecrementButton />
                                        <NumberField.Input />
                                        <NumberField.IncrementButton />
                                    </NumberField.Group>
                                </NumberField>
                            </Card.Footer>
                        </div>
                    </Card>
                ))}
            </div>
            <Pagination startTransition={startTransition} total={total} page={page} />
        </div>
    );
};

export const TransitCard = ({
    items,
    total,
    page,
    data,
}: DataCardProps<Query, TransitResult> & { data: GroupResult }) => {
    const [isPending, startTransition] = React.useTransition();

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <p className="text-default-500 text-sm">共找到{total}条记录</p>
            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <Card key={item.id} className="h-full min-w-0 transition-shadow hover:shadow-lg">
                        <Card.Header className="flex w-full flex-row items-start justify-between gap-3">
                            <div className="flex flex-row items-center gap-2">
                                <Chip variant="primary">
                                    <span className={iconMap[item.type]} />
                                    <Chip.Label>{typeMap[item.type]}</Chip.Label>
                                </Chip>
                                <Chip variant="primary" color={transitColorMap[item.status]}>
                                    {transitStatusMap[item.status]}
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
                                    <Card.Title>{item.carrier}</Card.Title>
                                    <Card.Description>{item.ticketNum}</Card.Description>
                                </div>
                            </div>
                            <div className="text-default-500 text-sm">{item.comment}</div>
                        </Card.Content>
                        <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                            <LinkButton href={`/groups/${data.id}/transit/${item.id}`} variant="secondary">
                                详情
                            </LinkButton>
                        </Card.Footer>
                    </Card>
                ))}
            </div>
            <Pagination startTransition={startTransition} total={total} page={page} />
        </div>
    );
};

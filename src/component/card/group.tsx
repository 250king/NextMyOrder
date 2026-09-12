"use client";
import React from "react";
import { Card, Chip, NumberField, toast } from "@heroui/react";
import { EnumFilter, SearchFilter, useFilter } from "@/component/common/filter";
import { LinkButton } from "@/component/common/link";
import { CardImage, ImagePreview } from "@/component/weight/image";
import { Loading } from "@/component/weight/loading";
import { Pagination } from "@/component/weight/pagination";
import { changeListCount } from "@/service/list";
import { DataCardProps, Query } from "@/type/common";
import { colorMap as groupColorMap, statusMap as groupStatusMap, GroupQuery, GroupResult } from "@/type/group";
import { ItemResult } from "@/type/item";
import {
    statusMap as orderStatusMap,
    colorMap as orderColorMap,
    OrderSnapshotResult,
} from "@/type/order";
import {
    statusMap as transitStatusMap,
    colorMap as transitColorMap,
    iconMap,
    typeMap,
    TransitResult,
} from "@/type/transit";
import { currency } from "@/util/cover";
import { getErrorMessage } from "@/util/request";

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

export const ListCard = ({
    data,
    items,
    total,
    page,
}: DataCardProps<Query, ItemResult & { selected: number }> & {
    data: GroupResult;
}) => {
    const [isPending, startTransition] = React.useTransition();
    const isEditable = data.status === "PENDING";

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <p className="text-default-500 text-sm">
                {isEditable ? `共找到${total}件可选商品` : `当前需求共${total}项`}
            </p>
            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <Card key={item.id} className="w-full items-stretch md:flex-row">
                        <div className="relative h-35 w-full shrink-0 overflow-hidden rounded-2xl sm:h-30 sm:w-30">
                            <ImagePreview
                                alt={item.name}
                                src={item.image || "https://static.250king.top/image/2026/04/i3f4xep2.png"}
                                className="h-full w-full scale-125 object-cover select-none"
                            />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-3">
                            <Card.Header className="gap-1">
                                <Card.Title className="truncate">{item.name}</Card.Title>
                            </Card.Header>
                            <Card.Content className="flex flex-1 flex-col gap-2">
                                <div className="text-xl font-bold">{currency(item.price, "JPY")}</div>
                            </Card.Content>
                            <Card.Footer className="mt-auto flex w-full items-center justify-end gap-2">
                                <LinkButton href={item.url} variant="secondary" isIconOnly>
                                    <span className="icon-[ri--external-link-line]" />
                                </LinkButton>
                                {isEditable ? (
                                    <NumberField
                                        variant="secondary"
                                        className="w-32"
                                        defaultValue={item.selected ?? 0}
                                        minValue={0}
                                        maxValue={99}
                                        formatOptions={{
                                            maximumFractionDigits: 0,
                                        }}
                                        onChange={async (value) => {
                                            try {
                                                await changeListCount({
                                                    itemId: item.id,
                                                    count: value,
                                                });
                                            } catch (error) {
                                                console.error(error);
                                                toast.danger(getErrorMessage(error));
                                            }
                                        }}
                                        name="count"
                                    >
                                        <NumberField.Group>
                                            <NumberField.DecrementButton />
                                            <NumberField.Input />
                                            <NumberField.IncrementButton />
                                        </NumberField.Group>
                                    </NumberField>
                                ) : (
                                    <div className="text-muted text-sm">
                                        数量 <span className="font-semibold">× {item.selected}</span>
                                    </div>
                                )}
                            </Card.Footer>
                        </div>
                    </Card>
                ))}
            </div>
            <Pagination startTransition={startTransition} total={total} page={page} />
        </div>
    );
};

export const OrderCard = ({
    items,
    total,
    page,
}: DataCardProps<Query, OrderSnapshotResult>) => {
    const [isPending, startTransition] = React.useTransition();

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <p className="text-default-500 text-sm">共生成{total}条订单</p>
            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((order) => (
                    <Card key={order.id} className="w-full items-stretch md:flex-row">
                        <div className="relative h-35 w-full shrink-0 overflow-hidden rounded-2xl sm:h-30 sm:w-30">
                            <ImagePreview
                                alt={order.itemName}
                                src={order.itemImage || "https://static.250king.top/image/2026/04/i3f4xep2.png"}
                                className="h-full w-full scale-125 object-cover select-none"
                            />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-3">
                            <Card.Header className="gap-1">
                                <Card.Title className="truncate">{order.itemName}</Card.Title>
                                <div className="flex flex-row items-center justify-between gap-2">
                                    <Chip variant="primary" color={orderColorMap[order.status]}>
                                        {orderStatusMap[order.status]}
                                    </Chip>
                                    <div className="text-muted shrink-0 font-mono text-sm">#{order.id}</div>
                                </div>
                            </Card.Header>
                            <Card.Content className="flex flex-1 flex-col gap-1">
                                <div className="text-xl font-bold">{currency(order.itemPrice, "JPY")}</div>
                                <div className="text-muted text-sm">数量 × {order.count}</div>
                            </Card.Content>
                            <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                                <LinkButton href={order.itemUrl} variant="secondary" isIconOnly>
                                    <span className="icon-[ri--external-link-line]" />
                                </LinkButton>
                                <LinkButton href={`/order/${order.id}`} variant="secondary">
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

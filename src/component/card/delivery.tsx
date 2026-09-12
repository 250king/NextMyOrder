"use client";
import React from "react";
import { Card, Chip } from "@heroui/react";
import { LinkButton } from "@/component/common/link";
import { ImagePreview } from "@/component/weight/image";
import { Loading } from "@/component/weight/loading";
import { Pagination } from "@/component/weight/pagination";
import { DataCardProps, Query } from "@/type/common";
import {
    colorMap as deliveryColorMap,
    DeliveryQuery,
    DeliveryResult,
    statusMap as deliveryStatusMap,
} from "@/type/delivery";
import { OrderResult } from "@/type/order";
import { currency, date } from "@/util/cover";

export const DeliveryCard = ({ items, total, page }: DataCardProps<DeliveryQuery, DeliveryResult>) => {
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
                                <Chip variant="primary" color={deliveryColorMap[item.status]}>
                                    {deliveryStatusMap[item.status]}
                                </Chip>
                            </div>
                            <span className="text-default-500 shrink-0 font-mono text-sm">#{item.id}</span>
                        </Card.Header>
                        <Card.Content className="flex flex-1 flex-col gap-2">
                            <div>
                                <Card.Title>{item.recipient}</Card.Title>
                                <Card.Description>{item.phone}</Card.Description>
                            </div>
                            <div className="text-default-500 text-sm">{item.address}</div>
                            <div className="text-default-500 text-sm">创建时间：{date(item.createdAt)}</div>
                        </Card.Content>
                        <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                            <LinkButton href={`/deliveries/${item.id}`} variant="secondary">
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
                    <Card key={item.id} className="w-full items-stretch md:flex-row">
                        <div className="relative h-35 w-full shrink-0 overflow-hidden rounded-2xl sm:h-30 sm:w-30">
                            <ImagePreview
                                alt={item.itemName}
                                src={item.itemImage || "https://static.250king.top/image/2026/04/i3f4xep2.png"}
                                className="h-full w-full scale-125 object-cover select-none"
                            />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-3">
                            <Card.Header className="gap-1">
                                <Card.Title className="truncate">{item.itemName}</Card.Title>
                                <div className="text-muted shrink-0 font-mono text-sm">#{item.id}</div>
                            </Card.Header>
                            <Card.Content className="flex flex-1 flex-col gap-2">
                                <div className="text-xl font-bold">
                                    {currency(item.itemPrice, "JPY")}
                                    <span className="px-1 align-baseline text-xs font-medium text-muted">
                                        × {item.count}
                                    </span>
                                </div>
                            </Card.Content>
                            <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                                <LinkButton href={`/order/${item.id}`} variant="secondary">
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

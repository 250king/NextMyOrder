"use client";
import React from "react";
import { Card, Chip } from "@heroui/react";
import { EnumFilter, useFilter } from "@/component/common/filter";
import { LinkButton } from "@/component/common/link";
import { Loading } from "@/component/weight/loading";
import { Pagination } from "@/component/weight/pagination";
import { DataCardProps } from "@/type/common";
import {
    colorMap,
    iconMap,
    methodMap,
    PaymentQuery,
    PaymentResult,
    statusMap,
    typeIconMap,
    typeMap,
} from "@/type/payment";
import { currency, date } from "@/util/cover";

export const PaymentCard = ({ items, total, page, method, isPaid, type }: DataCardProps<PaymentQuery, PaymentResult>) => {
    const [isPending, startTransition] = React.useTransition();
    const { updateFilter } = useFilter(startTransition);

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <EnumFilter
                label="收款项"
                currentValue={type}
                options={typeMap}
                onChange={(val) => updateFilter({ type: val })}
            />
            <EnumFilter
                label="支付方式"
                currentValue={method}
                options={methodMap}
                onChange={(val) => updateFilter({ method: val })}
            />
            <EnumFilter
                label="支付状态"
                currentValue={isPaid}
                options={statusMap}
                onChange={(val) => updateFilter({ isPaid: val })}
            />
            <p className="text-default-500 text-sm">共找到{total}条记录</p>
            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                    const types = [...new Set(item.items.map((paymentItem) => paymentItem.type))];

                    return (
                        <Card key={item.id} className="h-full min-w-0 transition-shadow hover:shadow-lg">
                            <Card.Header className="flex w-full flex-row items-start justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    {item.paidAt ? (
                                        <Chip variant="primary" color={colorMap[item.method!]}>
                                            <span className={`shrink-0 ${iconMap[item.method!]}`} />
                                            <Chip.Label>{methodMap[item.method!]}</Chip.Label>
                                        </Chip>
                                    ) : (
                                        <Chip variant="primary" color="warning">
                                            待付款
                                        </Chip>
                                    )}
                                    {types.map((paymentType) => (
                                        <Chip key={paymentType} variant="primary">
                                            <span className={typeIconMap[paymentType]} />
                                            <Chip.Label>{typeMap[paymentType]}</Chip.Label>
                                        </Chip>
                                    ))}
                                </div>
                                <span className="text-default-500 shrink-0 font-mono text-sm">#{item.id}</span>
                            </Card.Header>
                            <Card.Content className="flex flex-1 flex-col gap-2">
                                <div className="text-default-500 text-sm">包含 {item.items.length} 个收款项</div>
                                <div className="text-default-500 text-sm">创建时间：{date(item.createdAt)}</div>
                                {item.paidAt && (
                                    <div className="text-default-500 text-sm">支付时间：{date(item.paidAt)}</div>
                                )}
                                <div className="text-xl font-bold">{currency(item.amount, item.currency)}</div>
                            </Card.Content>
                            <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                                <LinkButton href={`/payments/${item.id}`} variant="secondary">
                                    详情
                                </LinkButton>
                            </Card.Footer>
                        </Card>
                    );
                })}
            </div>
            <Pagination startTransition={startTransition} total={total} page={page} />
        </div>
    );
};

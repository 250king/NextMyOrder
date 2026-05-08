"use client";
import React from "react";
import { Avatar, Card, Chip } from "@heroui/react";
import { EnumFilter, useFilter } from "@/component/common/filter";
import { Loading } from "@/component/common/loading";
import { Pagination } from "@/component/common/pagination";
import { LinkButton } from "@/component/navigation/button";
import { CardProps } from "@/type/card";
import { colorMap, iconMap, methodMap, PaymentQuery, PaymentResult, typeIconMap, typeMap } from "@/type/payment";
import { currency, date } from "@/util/string";

export const PaymentCard = ({ items, total, page, method, type }: CardProps<PaymentQuery, PaymentResult>) => {
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
            <p className="text-default-500 text-sm">共找到{total}条记录</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {items.map((item) => (
                    <div key={item.id} className="h-full">
                        <Card className="h-full min-w-0 transition-shadow hover:shadow-lg">
                            <Card.Header className="flex w-full flex-row items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <Avatar.Image src={`https://q.qlogo.cn/g?b=qq&nk=${item.user.qq}&s=100`} />
                                    </Avatar>
                                    <div className="min-w-0">
                                        <Card.Title>{item.user.name}</Card.Title>
                                        <Card.Description>{item.user.qq}</Card.Description>
                                    </div>
                                </div>
                                <span className="text-default-500 shrink-0 font-mono text-sm">#{item.id}</span>
                            </Card.Header>
                            <Card.Content className="flex flex-1 flex-col gap-2">
                                <div className="flex flex-row gap-2 items-center">
                                    <Chip>
                                        <span className={`shrink-0 ${typeIconMap[item.type]}`} />
                                        <Chip.Label className="truncate">
                                            {typeMap[item.type]} #{item.refId}
                                        </Chip.Label>
                                    </Chip>
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
                                </div>
                                <div className="text-default-500 text-sm">创建时间：{date(item.createdAt)}</div>
                                {item.paidAt && (
                                    <div className="text-default-too text-sm">支付时间：{date(item.paidAt)}</div>
                                )}
                                <div className="text-xl font-bold">
                                    {currency(item.amount, item.currency)}
                                    {item.currency != "CNY" && (
                                        <span className="px-1 align-baseline text-xs font-medium text-muted">
                                            ≈ {currency(item.amount * item.currencyRate, "CNY")}
                                        </span>
                                    )}
                                </div>
                            </Card.Content>
                            <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                                <LinkButton href={`/payments/${item.id}`} variant="secondary">
                                    详情
                                </LinkButton>
                            </Card.Footer>
                        </Card>
                    </div>
                ))}
            </div>
            <Pagination startTransition={startTransition} total={total} page={page} />
        </div>
    );
};

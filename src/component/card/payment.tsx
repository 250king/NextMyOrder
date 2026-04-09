"use client";
import React from "react";
import { Avatar, Card, Chip } from "@heroui/react";
import { FindAll1Params, PaymentResponse } from "@/api/model";
import { EnumFilter, useFilter } from "@/component/common/filter";
import { Loading } from "@/component/common/loading";
import { Pagination } from "@/component/common/pagination";
import { LinkButton } from "@/component/navigation/button";
import { CardProps } from "@/type/card";
import { colorMap, iconMap, methodMap, typeMap } from "@/type/payment";
import { currency } from "@/util/string";

export const PaymentCard = ({ items, total, isAdmin, page, method, type }: CardProps<FindAll1Params, PaymentResponse>) => {
    const [isPending, startTransition] = React.useTransition();
    const { updateFilter } = useFilter(startTransition);

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <EnumFilter label="收款项" currentValue={type} options={typeMap} onChange={(val) => updateFilter({ type: val })} />
            <EnumFilter label="支付方式" currentValue={method} options={methodMap} onChange={(val) => updateFilter({ method: val })} />
            <p className="text-default-500 text-sm">共找到{total}条记录</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {items.map((item) => (
                    <div key={item.id} className="h-full">
                        <Card className="h-full transition-shadow hover:shadow-lg">
                            <Card.Header className="flex w-full flex-row items-start justify-between gap-3">
                                <Card.Title className="flex items-center gap-3 font-semibold">
                                    <Card.Title className="flex items-center gap-3">
                                        <Avatar>
                                            <Avatar.Image src={`https://q.qlogo.cn/g?b=qq&nk=${item.user.qq}&s=100`} />
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="truncate font-semibold">{item.user.name}</div>
                                            <div className="text-default-500 text-xs truncate">{item.user.qq}</div>
                                        </div>
                                    </Card.Title>
                                </Card.Title>
                                <span className="text-default-500 shrink-0 font-mono text-sm">#{item.id}</span>
                            </Card.Header>
                            <Card.Content className="flex flex-1 flex-col gap-2">
                                <h3 className="text-xl font-bold">{currency(item.amount, item.currency)}</h3>
                                {item.paidAt && (
                                    <div className="flex flex-row gap-2 items-center">
                                        <Chip variant="primary" color={colorMap[item.method!]}>
                                            <span className={iconMap[item.method!]} />
                                            <Chip.Label>{new Date(item.paidAt).toLocaleString()}</Chip.Label>
                                        </Chip>
                                    </div>
                                )}
                                <div className="text-default-500 text-sm">创建时间：{new Date(item.createdAt).toLocaleString()}</div>
                                <div className="text-sm">
                                    收款项：
                                    <span className="font-medium">
                                        {typeMap[item.type]} #{item.referenceId}
                                    </span>
                                </div>
                            </Card.Content>
                            <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                                {item.paidAt ? (
                                    <LinkButton href={`/payments/${item.id}/receipt`}>生成凭证</LinkButton>
                                ) : (
                                    <>
                                        {isAdmin && (
                                            <LinkButton href={`/payments/${item.id}/edit`} variant="secondary">
                                                编辑
                                            </LinkButton>
                                        )}
                                        <LinkButton href={`/payments/${item.id}/pay`}>前往支付</LinkButton>
                                    </>
                                )}
                            </Card.Footer>
                        </Card>
                    </div>
                ))}
            </div>
            <Pagination startTransition={startTransition} total={total} page={page} />
        </div>
    );
};

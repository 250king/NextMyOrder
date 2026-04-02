"use client";
import React from "react";
import { Avatar, Card } from "@heroui/react";
import { FindAll1Params, PaymentResponse } from "@/api/model";
import { Loading } from "@/component/filter/loading";
import { Pagination } from "@/component/filter/pagination";
import { PaymentFilters } from "@/component/filter/payment";
import { LinkButton } from "@/component/navigation/button";
import { methodMap, typeMap } from "@/type/payment";
import { currency } from "@/util/string";

type CardProps = FindAll1Params & {
    items: PaymentResponse[];
    total: number;
    isAdmin: boolean;
};

export const PaymentCard = ({ items, total, isAdmin, page, method, type }: CardProps) => {
    const [isPending, startTransition] = React.useTransition();

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <PaymentFilters startTransition={startTransition} method={method} type={type} />
            <p className="text-default-500 text-sm">共找到{total}条记录</p>
            <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
                {items.map((item) => (
                    <div className="mb-4 break-inside-avoid" key={item.id}>
                        <Card className="transition-shadow hover:shadow-lg">
                            <Card.Header className="flex w-full flex-row items-start justify-between gap-3">
                                <Card.Title className="flex items-center gap-3 font-semibold">
                                    <Avatar>
                                        <Avatar.Image
                                            src={`https://q.qlogo.cn/g?b=qq&nk=${item.user.qq}&s=100`}
                                        />
                                    </Avatar>
                                    <div>{item.user.name}</div>
                                </Card.Title>
                                <span className="text-default-500 shrink-0 font-mono text-sm">
                                    #{item.id}
                                </span>
                            </Card.Header>
                            <Card.Content className="flex flex-col gap-2">
                                <div className="text-default-500 text-sm">
                                    创建时间：{new Date(item.createdAt).toLocaleString()}
                                </div>
                                <div className="text-sm">
                                    收款项：
                                    <span className="font-medium">
                                        {typeMap[item.type]} #{item.referenceId}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    金额：
                                    <span className="font-medium">
                                        {item.currency} {currency(item.amount, item.currency)}
                                    </span>
                                </div>
                                {item.paidAt && (
                                    <>
                                        <div className="text-sm">
                                            支付方式：
                                            <span className="font-medium">
                                                {methodMap[item.method!]}
                                            </span>
                                        </div>
                                        <div className="text-sm text-green-600">
                                            已支付于 {new Date(item.paidAt).toLocaleString()}
                                        </div>
                                    </>
                                )}
                            </Card.Content>
                            <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                                {item.paidAt ? (
                                    <LinkButton
                                        href={`/payments/${item.id}/receipt`}
                                        className="w-auto"
                                    >
                                        生成凭证
                                    </LinkButton>
                                ) : (
                                    <>
                                        {!isAdmin && (
                                            <LinkButton
                                                href={`/payments/${item.id}/edit`}
                                                variant="secondary"
                                                className="w-auto"
                                            >
                                                编辑
                                            </LinkButton>
                                        )}
                                        <LinkButton
                                            href={`/payments/${item.id}/pay`}
                                            className="w-auto"
                                        >
                                            前往支付
                                        </LinkButton>
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

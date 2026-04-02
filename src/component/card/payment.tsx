"use client";
import { Avatar, Card } from "@heroui/react";
import { PaymentResponse } from "@/api/model";
import { LinkButton } from "@/component/navigation/button";
import { methodMap, typeMap } from "@/type/payment";
import { currency } from "@/util/string";

interface CardProps {
    data: PaymentResponse,
    isAdmin: boolean
}

export const PaymentCard = ({data, isAdmin}: CardProps) => {
    return (
        <Card className="transition-shadow hover:shadow-lg">
            <Card.Header className="flex w-full flex-row items-start justify-between gap-3">
                <Card.Title className="flex items-center gap-3 font-semibold">
                    <Avatar>
                        <Avatar.Image src={`https://q.qlogo.cn/g?b=qq&nk=${data.user.qq}&s=100`} />
                    </Avatar>
                    <div>{data.user.name}</div>
                </Card.Title>
                <span className="text-default-500 shrink-0 font-mono text-sm">#{data.id}</span>
            </Card.Header>
            <Card.Content className="flex flex-col gap-2">
                <div className="text-default-500 text-sm">
                    创建时间：{new Date(data.createdAt).toLocaleString()}
                </div>
                <div className="text-sm">
                    收款项：
                    <span className="font-medium">
                        {typeMap[data.type]} #{data.referenceId}
                    </span>
                </div>
                <div className="text-sm">
                    金额：
                    <span className="font-medium">
                        {data.currency} {currency(data.amount, data.currency)}
                    </span>
                </div>
                {data.paidAt && (
                    <>
                        <div className="text-sm">
                            支付方式：
                            <span className="font-medium">{methodMap[data.method!]}</span>
                        </div>
                        <div className="text-sm text-green-600">
                            已支付于 {new Date(data.paidAt).toLocaleString()}
                        </div>
                    </>
                )}
            </Card.Content>
            <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                {data.paidAt ? (
                    <LinkButton href={`/payments/${data.id}/receipt`} className="w-auto">
                        生成凭证
                    </LinkButton>
                ) : (
                    <>
                        {!isAdmin && (
                            <LinkButton
                                href={`/payments/${data.id}/edit`}
                                variant="secondary"
                                className="w-auto"
                            >
                                编辑
                            </LinkButton>
                        )}
                        <LinkButton href={`/payments/${data.id}/pay`} className="w-auto">
                            前往支付
                        </LinkButton>
                    </>
                )}
            </Card.Footer>
        </Card>
    );
}

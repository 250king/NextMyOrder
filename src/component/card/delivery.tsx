"use client";
import React from "react";
import { Avatar, Card } from "@heroui/react";
import { DeliveryResponse, FindAll3Params } from "@/api/model";
import { Loading } from "@/component/filter/loading";
import { Pagination } from "@/component/filter/pagination";
import { LinkButton } from "@/component/navigation/button";
import { CardProps } from "@/type/card";

export const DeliveryCard = ({ items, total, isAdmin, page }: CardProps<FindAll3Params, DeliveryResponse>) => {
    const [isPending, startTransition] = React.useTransition();
    const [hidden, setHidden] = React.useState(true);

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <p className="text-default-500 text-sm">共找到{total}条记录</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {items.map((item) => (
                    <div className="mb-4 break-inside-avoid" key={item.id}>
                        <div key={item.id} className="h-full">
                            <Card className="h-full transition-shadow hover:shadow-lg">
                                <Card.Header className="flex w-full flex-row items-start justify-between gap-3">
                                    <Card.Title className="flex items-center gap-3 font-semibold">
                                        <Avatar>
                                            <Avatar.Image src={`https://q.qlogo.cn/g?b=qq&nk=${item.user.qq}&s=100`} />
                                        </Avatar>
                                        <div>{item.user.name}</div>
                                    </Card.Title>
                                    <span className="text-default-500 shrink-0 font-mono text-sm">#{item.id}</span>
                                </Card.Header>
                                <Card.Content className="flex flex-1 flex-col gap-2">
                                    <div className="flex flex-1 flex-row gap-2 items-center">
                                        <div className="text-default-500 text-lg font-bold">{item.name}</div>
                                        <div className="text-default-500">{item.phone}</div>
                                    </div>
                                    <div className="text-default-500 text-sm">{item.address}</div>
                                </Card.Content>
                                <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                                    <LinkButton href={`/payments/${item.id}/edit`} variant="secondary">
                                        编辑
                                    </LinkButton>
                                </Card.Footer>
                            </Card>
                        </div>
                    </div>
                ))}
            </div>
            <Pagination startTransition={startTransition} total={total} page={page} />
        </div>
    );
};

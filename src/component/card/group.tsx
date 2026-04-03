"use client";
import React from "react";
import Link from "next/link";
import { Button, Card, Chip } from "@heroui/react";
import { FindAll2Params, GroupResponse } from "@/api/model";
import { KeywordFilters } from "@/component/filter/keyword";
import { Loading } from "@/component/filter/loading";
import { Pagination } from "@/component/filter/pagination";
import { CardProps } from "@/type/card";
import { colorMap, statusMap } from "@/type/group";

export const GroupCard = ({ items, total, page, keyword }: CardProps<FindAll2Params, GroupResponse>) => {
    const [isPending, startTransition] = React.useTransition();

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <KeywordFilters startTransition={startTransition} keyword={keyword} />
            <p className="text-default-500 text-sm">共找到{total}条记录</p>
            <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
                {items.map((item) => (
                    <div className="mb-4 break-inside-avoid" key={item.id}>
                        <Card className="transition-shadow hover:shadow-lg">
                            <img
                                alt=""
                                className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
                                referrerPolicy="no-referrer"
                                src={item.image || "https://static.250king.top/image/2026/04/i3f4xep2.png"}
                            />
                            <Card.Content className="flex flex-col gap-2 py-2">
                                <h3 className="text-xl font-bold">{item.name}</h3>
                                <div className="flex flex-row gap-2 items-center">
                                    <Chip variant="primary" color="accent">
                                        <span className="icon-[ri--qq-fill]" />
                                        <Chip.Label>{item.qq}</Chip.Label>
                                    </Chip>
                                    <Chip variant="primary" color={colorMap[item.status]}>
                                        {statusMap[item.status]}
                                    </Chip>
                                </div>
                            </Card.Content>
                            <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                                <Link href={`/groups/${item.id}`}>
                                    <Button>进入团购</Button>
                                </Link>
                            </Card.Footer>
                        </Card>
                    </div>
                ))}
            </div>
            <Pagination startTransition={startTransition} total={total} page={page} />
        </div>
    );
};

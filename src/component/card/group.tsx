"use client";
import React from "react";
import { Card, Chip } from "@heroui/react";
import { EnumFilter, SearchFilter, useFilter } from "@/component/common/filter";
import { Loading } from "@/component/common/loading";
import { Pagination } from "@/component/common/pagination";
import {LinkButton} from "@/component/navigation/button";
import {CardImage} from "@/component/weight/image";
import { CardProps } from "@/type/card";
import { colorMap, GroupQuery, GroupResult, statusMap } from "@/type/group";

export const GroupCard = ({ items, total, status, page, keyword }: CardProps<GroupQuery, GroupResult>) => {
    const [isPending, startTransition] = React.useTransition();
    const { updateFilter } = useFilter(startTransition);

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <SearchFilter initialValue={keyword} onSearch={(val) => updateFilter({ keyword: val })} />
            <EnumFilter
                label="团购状态"
                currentValue={status}
                options={statusMap}
                onChange={(val) => updateFilter({ status: val })}
            />
            <p className="text-default-500 text-sm">共找到{total}条记录</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {items.map((item) => (
                    <div className="mb-4 break-inside-avoid" key={item.id}>
                        <Card className="transition-shadow hover:shadow-lg p-0 overflow-hidden">
                            <CardImage src={item.image || "https://static.250king.top/image/2026/04/i3f4xep2.png"} />
                            <Card.Content className="flex flex-col gap-2 p-4">
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
                            <Card.Footer className="mt-auto flex w-full justify-end gap-2 px-4 pb-4">
                                <LinkButton href={`/groups/${item.id}`} variant="secondary">详情</LinkButton>
                            </Card.Footer>
                        </Card>
                    </div>
                ))}
            </div>
            <Pagination startTransition={startTransition} total={total} page={page} />
        </div>
    );
};

"use client";
import React from "react";
import { Card, Chip } from "@heroui/react";
import { EnumFilter, SearchFilter, useFilter } from "@/component/common/filter";
import { LinkButton } from "@/component/common/link";
import { CardImage } from "@/component/weight/image";
import { Loading } from "@/component/weight/loading";
import { Pagination } from "@/component/weight/pagination";
import { DataCardProps } from "@/type/common";
import { colorMap, GroupQuery, GroupResult, statusMap } from "@/type/group";

export const GroupCard = ({ items, total, status, page, keyword }: DataCardProps<GroupQuery, GroupResult>) => {
    const [isPending, startTransition] = React.useTransition();
    const { updateFilter } = useFilter(startTransition);

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <SearchFilter key={keyword || ""} initialValue={keyword} onSearch={(val) => updateFilter({ keyword: val })} />
            <EnumFilter
                label="团购状态"
                currentValue={status}
                options={statusMap}
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
                                <Chip variant="primary" color={colorMap[item.status]}>
                                    {statusMap[item.status]}
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

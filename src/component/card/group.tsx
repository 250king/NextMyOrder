"use client";
import React from "react";
import { Card, Chip } from "@heroui/react";
import { EnumFilter, SearchFilter, useFilter } from "@/component/common/filter";
import { Loading } from "@/component/common/loading";
import { Pagination } from "@/component/common/pagination";
import { GroupCreateModal } from "@/component/modal/group";
import { LinkButton } from "@/component/navigation/button";
import { CardImage } from "@/component/weight/image";
import { CardProps } from "@/type/card";
import { colorMap, GroupQuery, GroupResult, statusMap } from "@/type/group";

export const GroupCard = ({ items, total, status, page, keyword, isAdmin }: CardProps<GroupQuery, GroupResult>) => {
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
            <div className="flex flex-row justify-between">
                <p className="text-default-500 text-sm">共找到{total}条记录</p>
                {isAdmin && <GroupCreateModal />}
            </div>
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

"use client";
import React from "react";
import { Avatar, Card, Checkbox, CheckboxGroup, Chip } from "@heroui/react";
import { LinkButton } from "@/component/common/link";
import { Loading } from "@/component/common/loading";
import { Pagination } from "@/component/common/pagination";
import { EnumFilter, SearchFilter, useFilter } from "@/component/data/filter";
import { DeliveryButton } from "@/component/navigation/delivery";
import { CardProps } from "@/type/card";
import { colorMap, companyMap, DeliveryQuery, DeliveryResult, iconMap, statusMap } from "@/type/delivery";
import { date } from "@/util/cover";

export const DeliveryCard = ({
    items,
    total,
    company,
    status,
    keyword,
    page,
    isAdmin,
}: CardProps<DeliveryQuery, DeliveryResult>) => {
    const [isPending, startTransition] = React.useTransition();
    const { updateFilter, updateLocalFilter, searchParams } = useFilter(startTransition);
    const selected = React.useMemo(() => {
        try {
            const current = searchParams.get("selected");
            return current ? (JSON.parse(current) as string[]) : [];
        } catch {
            return [];
        }
    }, [searchParams]);

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <SearchFilter key={keyword || ""} initialValue={keyword} onSearch={(val) => updateFilter({ keyword: val })} />
            <EnumFilter
                label="快递公司"
                currentValue={company}
                options={companyMap}
                onChange={(val) => updateFilter({ company: val })}
            />
            <EnumFilter
                label="订单状态"
                currentValue={status}
                options={statusMap}
                onChange={(val) => updateFilter({ status: val })}
            />
            <p className="text-default-500 text-sm">共找到{total}条记录</p>
            {isAdmin && <DeliveryButton items={items} />}
            <CheckboxGroup value={selected} onChange={(val) => updateLocalFilter({ selected: val.length > 0 ? JSON.stringify(val): null })}>
                <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <Checkbox key={item.id} value={item.id.toString()} variant="secondary" className="mt-0">
                            <Checkbox.Content className="w-full">
                                <Card className="h-full min-w-0 transition-shadow hover:shadow-lg">
                                    <Card.Header className="flex w-full flex-row items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <Avatar.Image
                                                    src={`https://q.qlogo.cn/g?b=qq&nk=${item.user.qq}&s=100`}
                                                />
                                            </Avatar>
                                            <div className="min-w-0">
                                                <Card.Title>{item.user.name}</Card.Title>
                                                <Card.Description>{item.user.qq}</Card.Description>
                                            </div>
                                        </div>
                                        <div className="flex flex-row gap-2 items-center">
                                            <span className="text-default-500 shrink-0 font-mono text-sm space-x-2">
                                                #{item.id}
                                            </span>
                                            <Checkbox.Control>
                                                <Checkbox.Indicator />
                                            </Checkbox.Control>
                                        </div>
                                    </Card.Header>
                                    <Card.Content className="flex flex-1 flex-col gap-2">
                                        <div className="flex flex-row items-center gap-2">
                                            {(!item.address || !item.phone || !item.recipient) && (
                                                <Chip variant="primary" color="warning">
                                                    物流信息未完善
                                                </Chip>
                                            )}
                                            {item.ticketNum && (
                                                <Chip variant="primary">
                                                    <span className={iconMap[item.company!]} />
                                                    <Chip.Label>{companyMap[item.company!]}</Chip.Label>
                                                </Chip>
                                            )}
                                            <Chip variant="primary" color={colorMap[item.status]}>
                                                {statusMap[item.status]}
                                            </Chip>
                                        </div>
                                        <div className="text-default-500 text-sm">创建时间：{date(item.createdAt)}</div>
                                    </Card.Content>
                                    <Card.Footer className="mt-auto flex w-full justify-end gap-2">
                                        <LinkButton href={`/deliveries/${item.id}`} variant="secondary">
                                            详情
                                        </LinkButton>
                                    </Card.Footer>
                                </Card>
                            </Checkbox.Content>
                        </Checkbox>
                    ))}
                </div>
            </CheckboxGroup>
            <Pagination startTransition={startTransition} total={total} page={page} />
        </div>
    );
};

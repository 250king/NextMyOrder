import React from "react";
import { notFound } from "next/navigation";
import { Alert, Button, ButtonGroup, Chip, Dropdown, Label, Surface } from "@heroui/react";
import { and, eq, exists } from "drizzle-orm";
import { db } from "@/service/db";
import { group, list } from "@/service/db/schema";
import { colorMap, statusMap } from "@/type/group";
import { getContext } from "@/util/context";
import { date } from "@/util/string";

type PageProps = {
    params: Promise<{
        groupId: number;
    }>;
};

const Page = async ({ params }: PageProps) => {
    const path = await params;
    const context = await getContext();
    const data = await db.query.group.findFirst({
        where: and(
            eq(group.id, path.groupId),
            ...(context.isAdmin ? [] : [
                exists(db.select().from(list).where(and(eq(list.groupId, group.id), eq(list.userId, context.uid!)))),
            ])
        ),
    });
    if (!data) {
        notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">{data.name}</h1>
                <div className="flex flex-wrap gap-2 items-center">
                    <Chip className="shrink-0" variant="primary" color={colorMap[data.status]}>
                        {statusMap[data.status]}
                    </Chip>
                </div>
                <Surface className="rounded-3xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-base font-semibold">基础信息</h2>
                        {context.isAdmin && data.status != "COMPLETED" && (
                            <ButtonGroup>
                                <Button variant="secondary">
                                    <span className={data.status == "PENDING" ? "icon-[ri--stop-fill]": "icon-[ri--play-fill]"}/>
                                    {data.status == "PENDING" ? "截单" : "重新开放"}
                                </Button>
                                <Dropdown>
                                    <Button isIconOnly variant="secondary">
                                        <ButtonGroup.Separator />
                                        <span className="icon-[ri--arrow-down-s-line]" />
                                    </Button>
                                    <Dropdown.Popover className="min-w-40" placement="bottom end">
                                        <Dropdown.Menu>
                                            <Dropdown.Item variant="danger">
                                                <Label>编辑信息</Label>
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown.Popover>
                                </Dropdown>
                            </ButtonGroup>
                        )}
                    </div>
                    <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                        <div className="min-w-0">
                            <div className="text-muted">群号</div>
                            <div className="font-medium">{data.qq}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">创建时间</div>
                            <div className="font-medium">{date(data.createdAt)}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">更新时间</div>
                            <div className="font-medium">{date(data.updatedAt)}</div>
                        </div>
                    </div>
                </Surface>
                {data.status == "PENDING" && (
                    <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>团购截止时间为 {date(data.deadline)}</Alert.Title>
                            <Alert.Description>请在截止时间前完成选购，过后将无法进行选购操作。</Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}
            </div>
        </div>
    );
};

export default Page;

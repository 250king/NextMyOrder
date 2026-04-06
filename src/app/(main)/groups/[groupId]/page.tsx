import React from "react";
import Link from "next/link";
import { Alert, Card, Chip } from "@heroui/react";
import { getGroupController } from "@/api/generated/group-controller/group-controller";
import { colorMap, statusMap } from "@/type/group";
import { getConfig, getContext } from "@/util/context";
import { date } from "@/util/string";

type PageProps = {
    params: Promise<{
        groupId: number;
    }>;
};

const Page = async ({ params }: PageProps) => {
    const query = await params;
    const context = await getContext();
    const group = await getGroupController().findById3(query.groupId, getConfig(context));
    const addList = [
        {
            name: "组员管理",
            path: `/groups/${group.id}/users`,
            description: "查看/管理组员信息",
            icon: "icon-[ri--group-fill]",
        },
        {
            name: "采购汇总",
            path: `/groups/${group.id}/summary`,
            description: "汇总全团的采购信息",
            icon: "icon-[ri--bar-chart-fill]",
        },
    ];
    const list = [
        {
            name: "商品选购",
            path: `/groups/${group.id}/buy`,
            description: "选购您想要的商品",
            icon: "icon-[ri--shopping-cart-2-line]",
        },
        {
            name: "需求单管理",
            path: `/groups/${group.id}/confirm`,
            description: "修改/确认您所选的商品信息",
            icon: "icon-[ri--file-list-2-line]",
        },
        ...(context.isAdmin ? addList : []),
    ];

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">{group.name}</h1>
                <div className="flex flex-wrap gap-2 items-center">
                    <Chip className="shrink-0" variant="primary" color="accent">
                        <span className="icon-[ri--qq-fill]" />
                        <Chip.Label>{group.qq}</Chip.Label>
                    </Chip>
                    <Chip className="shrink-0" variant="primary" color={colorMap[group.status]}>
                        {statusMap[group.status]}
                    </Chip>
                    <Chip className="shrink-0">
                        <span className="icon-[ri--time-line]" />
                        <Chip.Label>{date(group.createdAt)}</Chip.Label>
                    </Chip>
                    <Chip className="shrink-0">
                        <span className="icon-[ri--edit-2-fill]" />
                        <Chip.Label>{date(group.updatedAt)}</Chip.Label>
                    </Chip>
                </div>
                {group.status == "OPENING" && (
                    <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>团购截止时间为 {date(group.deadline)}</Alert.Title>
                            <Alert.Description>请在截止时间前完成选购，过后将无法进行选购操作。</Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                    {list.map((item) => (
                        <Link key={item.path} href={item.path}>
                            <div className="h-full">
                                <Card className="h-full transition-shadow hover:shadow-lg">
                                    <span className={`size-6 ${item.icon}`} />
                                    <Card.Header>
                                        <Card.Title>{item.name}</Card.Title>
                                        <Card.Description>{item.description}</Card.Description>
                                    </Card.Header>
                                </Card>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Page;

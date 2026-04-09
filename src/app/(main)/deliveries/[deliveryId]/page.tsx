import React from "react";
import Link from "next/link";
import { Card, Surface, Alert, Chip } from "@heroui/react";
import { getDeliveryController } from "@/api/generated/delivery-controller/delivery-controller";
import { colorMap, iconMap, statusMap } from "@/type/delivery";
import { getConfig, getContext } from "@/util/context";
import { date } from "@/util/string";

type PageProps = {
    params: Promise<{
        deliveryId: number;
    }>;
};

const Page = async ({ params }: PageProps) => {
    const query = await params;
    const context = await getContext();
    const delivery = await getDeliveryController().findById(query.deliveryId, getConfig(context));
    const list = [
        {
            name: "修改信息",
            path: `/deliveries/${delivery.id}/edit`,
            description: "查看/管理运单信息",
            icon: "icon-[ri--edit-2-fill]",
        },
        {
            name: "已绑定商品",
            path: `/deliveries/${delivery.id}/goods`,
            description: "查看/管理已绑定的商品",
            icon: "icon-[ri--shopping-cart-2-line]",
        },
    ];

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">分发管理 #{delivery.id}</h1>
                <div className="flex flex-wrap gap-2 items-center">
                    {delivery.trackingNumber && (
                        <Chip variant="primary">
                            <span className={iconMap[delivery.company!]} />
                            <Chip.Label>{delivery.trackingNumber}</Chip.Label>
                        </Chip>
                    )}
                    <Chip variant="primary" color={colorMap[delivery.status]}>
                        {statusMap[delivery.status]}
                    </Chip>
                    <Chip className="shrink-0">
                        <span className="icon-[ri--time-line]" />
                        <Chip.Label>{date(delivery.createdAt)}</Chip.Label>
                    </Chip>
                    <Chip className="shrink-0">
                        <span className="icon-[ri--edit-2-fill]" />
                        <Chip.Label>{date(delivery.updatedAt)}</Chip.Label>
                    </Chip>
                </div>
                {delivery.comment && (
                    <Alert>
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>运单备注</Alert.Title>
                            <Alert.Description>{delivery.comment}</Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}
                {!delivery.address || !delivery.name || !delivery.phone ? (
                    <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>部分收件人信息不完善</Alert.Title>
                            <Alert.Description>请尽快完善收件人信息，否则商品无法发出</Alert.Description>
                        </Alert.Content>
                    </Alert>
                ) : (
                    <Surface className="flex flex-col gap-3 rounded-3xl p-6" variant="tertiary">
                        <h3 className="text-base font-semibold text-foreground">{delivery.name}</h3>
                        <p className="text-sm text-muted">{delivery.phone}</p>
                        <p className="text-muted">{delivery.address}</p>
                    </Surface>
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

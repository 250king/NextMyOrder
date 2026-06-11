"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, ButtonGroup, Dropdown, Label } from "@heroui/react";
import { ImageEncoder } from "@mmote/niimbluelib";
import { AlertModal } from "@/component/common/alert";
import { LinkButton } from "@/component/common/link";
import { DeliveryPushModal, DeliveryWithdrawModal, GoodsModal } from "@/component/modal/delivery";
import { usePrinter } from "@/component/weight/printer";
import { SelectAll } from "@/component/weight/select";
import { generateQrCode, removeDelivery } from "@/service/delivery";
import { companyMap, DeliveryResult } from "@/type/delivery";
import { OrderResult } from "@/type/order";
import { createLabelCanvas, downloadCanvas } from "@/util/print";
import { useHttp } from "@/util/request";

export const DeliveryButton = ({ items }: { items: DeliveryResult[] }) => {
    const [open, setOpen] = React.useState(false);
    const searchParams = useSearchParams();
    const selected = JSON.parse(searchParams.get("selected") || "[]") as number[];

    return (
        <div className="flex flex-row justify-between">
            <SelectAll items={items} />
            <ButtonGroup className="ml-auto">
                <LinkButton href="/deliveries/create">新建运单</LinkButton>
                <Dropdown>
                    <Button isIconOnly>
                        <ButtonGroup.Separator />
                        <span className="icon-[ri--arrow-down-s-line]" />
                    </Button>
                    <Dropdown.Popover className="min-w-40" placement="bottom end">
                        <Dropdown.Menu>
                            <Dropdown.Item isDisabled={selected.length == 0} onClick={() => setOpen(true)}>
                                <Label>运单推送</Label>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
            </ButtonGroup>
            <DeliveryPushModal open={open} onChange={setOpen} selected={selected} />
        </div>
    );
};

export const DeliveryDetailButton = ({ data }: { data: DeliveryResult }) => {
    const [remove, setRemove] = React.useState(false);
    const [withdraw, setWithdraw] = React.useState(false);
    const router = useRouter();
    const { getClient, isPending } = usePrinter();
    const [loading, runAction] = useHttp();

    const createDeliveryCanvas = async () => {
        if (!data.company || !data.recipient || !data.phone) {
            throw new Error("请完善运单信息");
        }
        const result = await generateQrCode(data.id);
        return createLabelCanvas({
            url: result.url,
            carrierName: companyMap[data.company],
            receiverName: data.recipient,
            receiverPhone: data.phone,
            receiverCity: result.city || "",
        });
    };

    const handlePrint = () => {
        runAction(async () => {
            const client = await getClient();
            const canvas = await createDeliveryCanvas();
            const image = ImageEncoder.encodeCanvas(canvas, "top");
            const printTask = client.abstraction.newPrintTask("B1", {
                totalPages: 1,
                statusPollIntervalMs: 100,
                statusTimeoutMs: 8000,
            });

            try {
                await printTask.printInit();
                await printTask.printPage(image, 1);
                await printTask.waitForFinished();
            } finally {
                await printTask.printEnd();
            }
        });
    };

    const handleDownload = () => {
        runAction(async () => {
            const canvas = await createDeliveryCanvas();
            downloadCanvas(canvas, `delivery-${data.id}-label.png`);
        });
    };

    return (
        <ButtonGroup className="ml-auto">
            <Button isDisabled={loading || isPending} onClick={handlePrint}>
                打印运单
            </Button>
            <Dropdown>
                <Button isIconOnly>
                    <ButtonGroup.Separator />
                    <span className="icon-[ri--arrow-down-s-line]" />
                </Button>
                <Dropdown.Popover className="min-w-40" placement="bottom end">
                    <Dropdown.Menu>
                        <Dropdown.Item isDisabled={loading || isPending} onClick={handleDownload}>
                            <Label>下载标签预览</Label>
                        </Dropdown.Item>
                        {data.status == "PUSHED" && (
                            <Dropdown.Item variant="danger" onClick={() => setWithdraw(true)}>
                                <Label>撤回</Label>
                            </Dropdown.Item>
                        )}
                        {data.status == "PENDING" && (
                            <Dropdown.Item variant="danger" onClick={() => setRemove(true)}>
                                <Label>删除</Label>
                            </Dropdown.Item>
                        )}
                    </Dropdown.Menu>
                </Dropdown.Popover>
                <DeliveryWithdrawModal open={withdraw} onChange={setWithdraw} data={data} />
                <AlertModal
                    title="确认移除运单"
                    status="danger"
                    open={remove}
                    onOpenChange={setRemove}
                    onConfirmed={async () => {
                        await removeDelivery(data.id);
                        router.replace("/deliveries");
                    }}
                >
                    <div>该操作不可逆，请谨慎操作</div>
                </AlertModal>
            </Dropdown>
        </ButtonGroup>
    );
};

export const GoodsButton = ({ items, data }: { items: OrderResult[]; data: DeliveryResult }) => {
    const [, setOpen] = React.useState(false);
    const searchParams = useSearchParams();
    const selected = JSON.parse(searchParams.get("selected") || "[]") as number[];

    return (
        <div className="flex flex-row justify-between">
            <SelectAll items={items} />
            {data.status === "PENDING" && (
                <ButtonGroup className="ml-auto">
                    <GoodsModal data={data} />
                    <Dropdown>
                        <Button isIconOnly>
                            <ButtonGroup.Separator />
                            <span className="icon-[ri--arrow-down-s-line]" />
                        </Button>
                        <Dropdown.Popover className="min-w-40" placement="bottom end">
                            <Dropdown.Menu>
                                <Dropdown.Item
                                    isDisabled={selected.length == 0}
                                    onClick={() => setOpen(true)}
                                    variant="danger"
                                >
                                    <Label>移除商品</Label>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                </ButtonGroup>
            )}
        </div>
    );
};

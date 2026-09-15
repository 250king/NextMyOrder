"use client";

import React from "react";
import { Button, Description, FieldError, Label, Modal, Radio, RadioGroup } from "@heroui/react";
import clsx from "clsx";
import { LinkButton } from "@/component/common/link";
import { getAddresses } from "@/service/address";
import { DeliveryCompany as DeliveryCompanyEnum } from "@/service/db/schema";
import { saveDelivery } from "@/service/delivery";
import { AddressResult } from "@/type/address";
import { companyMap, DeliveryCompany, DeliveryResult, iconMap } from "@/type/delivery";
import { useHttp } from "@/util/request";

export const DeliveryModifyModal = ({ data }: { data: DeliveryResult }) => {
    const [addresses, setAddresses] = React.useState<AddressResult[]>([]);
    const [isPending, runAction] = useHttp();
    const [open, setOpen] = React.useState(false);
    const companyOptions = DeliveryCompanyEnum.enumValues.map((company) => ({
        id: company,
        label: companyMap[company],
        icon: iconMap[company],
    }));

    React.useEffect(() => {
        if (open) {
            getAddresses().then(setAddresses);
        }
    }, [open]);

    const currentAddressId = addresses.find(
        (address) =>
            address.recipient === data.recipient && address.phone === data.phone && address.address === data.address
    )?.id;

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const addressId = Number(form.get("addressId"));
        const company = (form.get("company") as DeliveryCompany | null) || null;
        runAction(
            async () => {
                await saveDelivery({ deliveryId: data.id, addressId, company });
                setOpen(false);
            },
            { success: "分发信息已更新" }
        );
    };

    return (
        <Modal onOpenChange={setOpen} isOpen={open}>
            <Button variant="secondary">
                <span className="icon-[ri--edit-box-fill]" />
                编辑
            </Button>
            <Modal.Backdrop>
                <Modal.Container placement="center" scroll="outside" size="lg">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>修改分发信息</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="p-2">
                            {addresses.length === 0 ? (
                                <div className="flex flex-col items-start gap-3 py-4">
                                    <div>
                                        <div className="font-medium">地址簿暂无可用地址</div>
                                        <div className="text-muted mt-1 text-sm">先添加一个常用地址，再回来选择。</div>
                                    </div>
                                    <LinkButton href="/addresses" variant="secondary">
                                        前往地址簿
                                    </LinkButton>
                                </div>
                            ) : (
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <RadioGroup
                                        name="addressId"
                                        variant="secondary"
                                        defaultValue={currentAddressId ? String(currentAddressId) : undefined}
                                        isDisabled={isPending}
                                        isRequired
                                    >
                                        <Label>收件地址</Label>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {addresses.map((option) => (
                                                <Radio
                                                    key={option.id}
                                                    value={String(option.id)}
                                                    className={clsx(
                                                        "group relative flex-col gap-4 rounded-lg border border-transparent bg-default p-4 transition-all",
                                                        "data-[hovered=true]:bg-default-hover",
                                                        "data-[selected=true]:border-accent data-[selected=true]:bg-accent/10"
                                                    )}
                                                >
                                                    <Radio.Control className="absolute top-3 right-4 size-5">
                                                        <Radio.Indicator />
                                                    </Radio.Control>
                                                    <Radio.Content className="flex flex-col items-start gap-1 pr-6">
                                                        <Label>{option.recipient}</Label>
                                                        <Description>{option.phone}</Description>
                                                        <Description>{option.address}</Description>
                                                    </Radio.Content>
                                                </Radio>
                                            ))}
                                        </div>
                                        <FieldError />
                                    </RadioGroup>

                                    <RadioGroup
                                        name="company"
                                        defaultValue={data.company ?? undefined}
                                        variant="secondary"
                                        isDisabled={isPending}
                                    >
                                        <Label>快递方式</Label>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {companyOptions.map((option) => (
                                                <Radio
                                                    key={option.id}
                                                    value={option.id}
                                                    className={clsx(
                                                        "group relative flex-col rounded-lg border border-transparent bg-default p-4 transition-all",
                                                        "data-[hovered=true]:bg-default-hover",
                                                        "data-[selected=true]:border-accent data-[selected=true]:bg-accent/10"
                                                    )}
                                                >
                                                    <Radio.Control className="absolute top-3 right-4 size-5">
                                                        <Radio.Indicator />
                                                    </Radio.Control>
                                                    <Radio.Content className="flex flex-row items-center gap-3">
                                                        <span className={option.icon} />
                                                        <Label>{option.label}</Label>
                                                    </Radio.Content>
                                                </Radio>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                    <div className="flex justify-end">
                                        <Button type="submit" isPending={isPending}>
                                            保存
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

"use client";
import React from "react";
import {
    Button,
    Checkbox,
    Description,
    FieldError,
    Input,
    Label,
    Modal,
    Radio,
    RadioGroup,
    Tabs,
    TextArea,
    TextField,
} from "@heroui/react";
import clsx from "clsx";
import { deliveryCompany } from "@/service/db/schema";
import { getAddresses, saveDelivery } from "@/service/delivery";
import { AddressResult } from "@/type/address";
import { companyMap, DeliveryCompany, DeliveryResult, iconMap } from "@/type/delivery";

export const DeliveryModal = ({ data }: { data: Omit<DeliveryResult, "user"> }) => {
    const [addresses, setAddresses] = React.useState<AddressResult[]>([]);
    const [isPending, startTransition] = React.useTransition();
    const [open, setOpen] = React.useState<boolean>(false)
    const companyOptions = deliveryCompany.enumValues.map((company) => ({
        id: company,
        label: companyMap[company],
        icon: iconMap[company],
    }));
    React.useEffect(() => {
        getAddresses(data.id).then((r) => {
            setAddresses(r);
        });
    }, [data.id, open]);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>, close: () => void) => {
        e.preventDefault();
        if (isPending) {
            return;
        }
        const formData = new FormData(e.target);
        const addressId = formData.get("addressId") as string;
        const recipient = formData.get("recipient") as string;
        const phone = formData.get("phone") as string;
        const address = formData.get("address") as string;
        const save = formData.get("save") === "on";
        const company = formData.get("company") as DeliveryCompany;
        console.log(save);
        startTransition(async () => {
            if (addressId) {
                await saveDelivery(data.id, {
                    company,
                    addressId: Number(addressId),
                });
            } else {
                await saveDelivery(data.id, {
                    company,
                    recipient,
                    phone,
                    address,
                    save,
                });
            }
            close()
        });
    };

    return (
        <Modal onOpenChange={setOpen}>
            <Button variant="secondary">
                <span className="icon-[ri--edit-2-fill]" />
                编辑
            </Button>
            <Modal.Backdrop>
                <Modal.Container placement="center">
                    <Modal.Dialog className="sm:max-w-2xl">
                        {({ close }) => (
                            <>
                                <Modal.CloseTrigger />
                                <Modal.Header>
                                    <Modal.Heading>修改信息</Modal.Heading>
                                </Modal.Header>
                                <Modal.Body>
                                    <form
                                        className="flex flex-col gap-4"
                                        autoComplete="on"
                                        onSubmit={(e) => handleSubmit(e, close)}
                                    >
                                        <Tabs>
                                            <Tabs.ListContainer className="w-fit max-w-full p-2">
                                                <Tabs.List className="w-fit max-w-full *:w-fit *:whitespace-nowrap">
                                                    <Tabs.Tab id="blank" isDisabled={isPending}>
                                                        直接填写
                                                        <Tabs.Indicator />
                                                    </Tabs.Tab>
                                                    <Tabs.Tab id="book" isDisabled={isPending}>
                                                        从最近使用地址筛选
                                                        <Tabs.Indicator />
                                                    </Tabs.Tab>
                                                </Tabs.List>
                                            </Tabs.ListContainer>
                                            <Tabs.Panel id="blank" className="flex flex-col gap-4">
                                                <TextField
                                                    isRequired
                                                    className="w-full"
                                                    name="recipient"
                                                    type="text"
                                                    variant="secondary"
                                                    defaultValue={data.recipient}
                                                    pattern="[A-Za-z0-9 \u4e00-\u9fff]+"
                                                    isDisabled={isPending}
                                                >
                                                    <Label>收件人</Label>
                                                    <Input autoComplete="name" />
                                                    <FieldError />
                                                </TextField>
                                                <TextField
                                                    className="w-full"
                                                    name="phone"
                                                    type="tel"
                                                    variant="secondary"
                                                    defaultValue={data.phone ?? undefined}
                                                    pattern="^1[3-9]\d{9}$"
                                                    isDisabled={isPending}
                                                >
                                                    <Label>手机号</Label>
                                                    <Input autoComplete="tel" />
                                                    <FieldError />
                                                </TextField>
                                                <TextField
                                                    className="w-full"
                                                    name="address"
                                                    type="text"
                                                    variant="secondary"
                                                    defaultValue={data.address ?? undefined}
                                                    pattern="[A-Za-z0-9 \u4e00-\u9fff]+"
                                                    isDisabled={isPending}
                                                >
                                                    <Label>地址</Label>
                                                    <TextArea autoComplete="street-address" />
                                                    <FieldError />
                                                </TextField>
                                                <Checkbox
                                                    id="save"
                                                    name="save"
                                                    variant="secondary"
                                                    isDisabled={isPending}
                                                >
                                                    <Checkbox.Control>
                                                        <Checkbox.Indicator />
                                                    </Checkbox.Control>
                                                    <Checkbox.Content>
                                                        <Label htmlFor="save">保存地址供下次使用</Label>
                                                    </Checkbox.Content>
                                                </Checkbox>
                                            </Tabs.Panel>
                                            <Tabs.Panel id="book">
                                                <RadioGroup name="addressId" variant="secondary" isDisabled={isPending}>
                                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                                        <Label>选择地址</Label>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                                                        {addresses.map((option) => (
                                                            <Radio
                                                                key={option.id}
                                                                value={String(option.id)}
                                                                className={clsx(
                                                                    "group relative flex-col gap-4 rounded-lg border border-transparent bg-default p-4 transition-all items-center",
                                                                    "data-[hovered=true]:bg-default-hover",
                                                                    "data-[selected=true]:border-accent data-[selected=true]:bg-accent/10"
                                                                )}
                                                            >
                                                                <Radio.Control className="absolute top-3 right-4 size-5">
                                                                    <Radio.Indicator />
                                                                </Radio.Control>
                                                                <Radio.Content className="flex flex-col items-start justify-start gap-2">
                                                                    <Label>{option.recipient}</Label>
                                                                    <Description>
                                                                        {option.phone} {option.address}
                                                                    </Description>
                                                                </Radio.Content>
                                                            </Radio>
                                                        ))}
                                                    </div>
                                                </RadioGroup>
                                            </Tabs.Panel>
                                        </Tabs>
                                        <RadioGroup
                                            name="company"
                                            className="p-2"
                                            defaultValue={data.company}
                                            variant="secondary"
                                            isDisabled={isPending}
                                        >
                                            <div className="flex flex-wrap items-center justify-between">
                                                <Label>快递方式</Label>
                                            </div>
                                            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
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
                                                        <Radio.Content className="flex flex-row items-center justify-start gap-4">
                                                            <span className={clsx(option.icon)} />
                                                            <Label>{option.label}</Label>
                                                        </Radio.Content>
                                                    </Radio>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                        <Button type="submit" isPending={isPending}>
                                            提交
                                        </Button>
                                    </form>
                                </Modal.Body>
                            </>
                        )}
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

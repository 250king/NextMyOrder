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
import { useFilter } from "@/component/common/filter";
import { DeliveryCompany as DeliveryCompanyEnum } from "@/service/db/schema";
import {
    getAddresses,
    getSenderAddresses,
    pushDelivery,
    saveDelivery,
    withdrawDelivery,
} from "@/service/delivery";
import { AddressResult } from "@/type/address";
import { ModalState } from "@/type/common";
import { companyMap, DeliveryCompany, DeliveryResult, iconMap } from "@/type/delivery";
import { useHttp } from "@/util/request";

export const DeliveryModifyModal = ({ data }: { data: DeliveryResult }) => {
    const [addresses, setAddresses] = React.useState<AddressResult[]>([]);
    const [isPending, runAction] = useHttp();
    const [open, setOpen] = React.useState<boolean>(false);
    const companyOptions = DeliveryCompanyEnum.enumValues.map((company) => ({
        id: company,
        label: companyMap[company],
        icon: iconMap[company],
    }));
    React.useEffect(() => {
        getAddresses(data.id).then((r) => {
            setAddresses(r);
        });
    }, [data.id, open]);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isPending) {
            return;
        }
        const formData = new FormData(e.target);
        const addressId = Number(formData.get("addressId") as string);
        const recipient = (formData.get("recipient") as string) || null;
        const phone = (formData.get("phone") as string) || null;
        const address = (formData.get("address") as string) || null;
        const save = formData.get("save") === "on";
        const company = (formData.get("company") as DeliveryCompany) || null;
        const comment = (formData.get("comment") as string) || null;
        runAction(async () => {
            if (addressId) {
                await saveDelivery({
                    company,
                    deliveryId: data.id,
                    addressId: addressId,
                });
            } else {
                await saveDelivery({
                    save,
                    deliveryId: data.id,
                    company: company,
                    recipient: recipient,
                    phone: phone,
                    address: address,
                    comment: comment,
                });
            }
            setOpen(false);
        });
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
                            <Modal.Heading>修改信息</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="p-2">
                            <form className="space-y-4" autoComplete="on" onSubmit={handleSubmit}>
                                <Tabs>
                                    <Tabs.ListContainer className="w-fit max-w-full">
                                        <Tabs.List className="w-fit max-w-full *:w-fit *:whitespace-nowrap">
                                            <Tabs.Tab id="blank" isDisabled={isPending}>
                                                直接填写
                                                <Tabs.Indicator />
                                            </Tabs.Tab>
                                            <Tabs.Tab id="book" isDisabled={isPending || addresses.length === 0}>
                                                从最近使用地址筛选
                                                <Tabs.Indicator />
                                            </Tabs.Tab>
                                        </Tabs.List>
                                    </Tabs.ListContainer>
                                    <Tabs.Panel id="blank" className="space-y-4 p-0">
                                        <TextField
                                            isRequired
                                            fullWidth
                                            name="recipient"
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
                                            fullWidth
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
                                            fullWidth
                                            name="address"
                                            variant="secondary"
                                            defaultValue={data.address ?? undefined}
                                            pattern="[A-Za-z0-9 \u4e00-\u9fff（）()#、，。,./-]+"
                                            isDisabled={isPending}
                                        >
                                            <Label>地址</Label>
                                            <TextArea autoComplete="street-address" />
                                            <FieldError />
                                        </TextField>
                                        <Checkbox id="save" name="save" variant="secondary" isDisabled={isPending}>
                                            <Checkbox.Control>
                                                <Checkbox.Indicator />
                                            </Checkbox.Control>
                                            <Checkbox.Content>
                                                <Label htmlFor="save">保存地址供下次使用</Label>
                                            </Checkbox.Content>
                                        </Checkbox>
                                    </Tabs.Panel>
                                    <Tabs.Panel id="book" className="p-0">
                                        <RadioGroup
                                            name="addressId"
                                            variant="secondary"
                                            isDisabled={isPending}
                                            isRequired
                                        >
                                            <Label>选择地址</Label>
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
                                            <FieldError />
                                        </RadioGroup>
                                    </Tabs.Panel>
                                </Tabs>
                                <RadioGroup
                                    name="company"
                                    defaultValue={data.company}
                                    variant="secondary"
                                    isDisabled={isPending}
                                >
                                    <Label>快递方式</Label>
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
                                <div className="flex flex-row justify-end gap-2">
                                    <Button type="submit" isPending={isPending}>
                                        提交
                                    </Button>
                                </div>
                            </form>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

export const DeliveryPushModal = ({
    selected,
    open,
    onChange,
}: ModalState & {
    selected: number[];
}) => {
    const [addresses, setAddresses] = React.useState<AddressResult[]>([]);
    const [, startTransition] = React.useTransition();
    const [isPending, runAction] = useHttp();
    const { updateLocalFilter } = useFilter(startTransition);

    React.useEffect(() => {
        getSenderAddresses().then((r) => {
            setAddresses(r);
        });
    }, [open]);

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const addressId = Number(formData.get("addressId") as string);
        runAction(async () => {
            const result = await pushDelivery(
                selected.map((i) => Number(i)),
                addressId
            );
            updateLocalFilter({
                selected: JSON.stringify(selected.filter((i) => !result.includes(i))),
            });
            onChange(false);
        });
    };

    return (
        <Modal isOpen={open} onOpenChange={onChange}>
            <Modal.Backdrop>
                <Modal.Container placement="center" size="lg">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>推送运单</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="p-2">
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <RadioGroup name="addressId" variant="secondary" isDisabled={isPending} isRequired>
                                    <Label>选择发货地址</Label>
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
                                    <FieldError />
                                </RadioGroup>
                                <div className="flex flex-row justify-end gap-2">
                                    <Button type="submit" isPending={isPending}>
                                        提交
                                    </Button>
                                </div>
                            </form>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

export const DeliveryWithdrawModal = ({ data, open, onChange }: ModalState<DeliveryResult>) => {
    const [isPending, runAction] = useHttp();

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const reason = formData.get("reason") as string;
        runAction(async () => {
            await withdrawDelivery(data.id, reason);
            onChange(false);
        });
    };

    return (
        <Modal isOpen={open} onOpenChange={onChange}>
            <Modal.Backdrop>
                <Modal.Container placement="center">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>撤回运单</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="p-2">
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    name="reason"
                                    variant="secondary"
                                    isRequired
                                    isDisabled={isPending}
                                >
                                    <Label>撤回原因</Label>
                                    <TextArea />
                                    <FieldError />
                                </TextField>
                                <div className="flex flex-row justify-end gap-2">
                                    <Button type="submit" isPending={isPending}>
                                        提交
                                    </Button>
                                </div>
                            </form>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

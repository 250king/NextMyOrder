"use client";
import React from "react";
import {
    Button,
    Card,
    Checkbox,
    CheckboxGroup,
    Description, EmptyState,
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
import { ImagePreview } from "@/component/weight/image";
import { DeliveryCompany as DeliveryCompanyEnum } from "@/service/db/schema";
import {bindOrders, getAddresses, getSenderAddresses, pushDelivery, saveDelivery, withdrawDelivery } from "@/service/delivery";
import { getOrders } from "@/service/order";
import { AddressResult } from "@/type/address";
import { ModalState } from "@/type/common";
import { companyMap, DeliveryCompany, DeliveryResult, iconMap } from "@/type/delivery";
import { OrderResult } from "@/type/order";
import { currency } from "@/util/cover";
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

export const GoodsModal = ({ data }: { data: DeliveryResult }) => {
    const [orders, setOrders] = React.useState<OrderResult[]>([]);
    const [open, setOpen] = React.useState(false);
    const [isPending, runAction] = useHttp();
    React.useEffect(() => {
        getOrders({
            userId: data.user.id,
            notInDelivery: data.id,
        }).then((result) => {
            setOrders(result.items);
        });
    }, [data.id, data.user.id, open]);

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isPending) {
            return;
        }
        const formData = new FormData(e.target);
        const orderIds = formData.getAll("orderIds").map((id) => Number(id));
        runAction(async () => {
            await bindOrders(data.id, orderIds);
            setOpen(false);
        });
    }

    return (
        <Modal isOpen={open} onOpenChange={setOpen}>
            <Button>绑定订单</Button>
            <Modal.Backdrop>
                <Modal.Container placement="center" size="cover">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>绑定订单</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="min-h-0 flex-1 p-2 flex flex-row items-center justify-center">
                            {orders.length > 0 ? (
                                <form className="flex h-full min-h-0 flex-col space-x-4" onSubmit={handleSubmit}>
                                    <CheckboxGroup name="orderIds" className="min-h-0 flex-1">
                                        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {orders.map((item) => (
                                                <Checkbox
                                                    key={item.id}
                                                    value={item.id.toString()}
                                                    variant="secondary"
                                                    className="mt-0"
                                                >
                                                    <Checkbox.Content className="w-full">
                                                        <Card
                                                            className="h-full min-w-0 transition-shadow hover:shadow-lg w-full items-center flex-row"
                                                            variant="secondary"
                                                        >
                                                            <div className="relative shrink-0 overflow-hidden rounded-2xl h-30 w-30">
                                                                <ImagePreview
                                                                    alt={item.item.name}
                                                                    src={
                                                                        item.item.image ||
                                                                        "https://static.250king.top/image/2026/04/i3f4xep2.png"
                                                                    }
                                                                    className="pointer-events-none h-full w-full scale-125 object-cover select-none"
                                                                />
                                                            </div>
                                                            <div className="flex flex-1 flex-col gap-3 min-w-0">
                                                                <div className="flex flex-row justify-between gap-1 min-w-0">
                                                                    <Card.Header className="min-w-0 flex-1">
                                                                        <div className="min-w-0 flex-1">
                                                                            <Card.Title className="truncate">
                                                                                {item.item.name}
                                                                            </Card.Title>
                                                                            <Card.Description>
                                                                                #{item.id}
                                                                            </Card.Description>
                                                                        </div>
                                                                    </Card.Header>
                                                                    <Checkbox.Control className="shrink-0">
                                                                        <Checkbox.Indicator />
                                                                    </Checkbox.Control>
                                                                </div>
                                                                <Card.Content className="flex flex-1 flex-col gap-2">
                                                                    <div className="text-foreground">
                                                                        {item.item.group.name}
                                                                    </div>
                                                                    <div className="text-xl font-bold text-foreground">
                                                                        {currency(item.item.price, "JPY")}
                                                                        <span className="px-1 align-baseline text-xs font-medium text-muted">
                                                                            × {item.count}
                                                                        </span>
                                                                    </div>
                                                                </Card.Content>
                                                            </div>
                                                        </Card>
                                                    </Checkbox.Content>
                                                </Checkbox>
                                            ))}
                                        </div>
                                    </CheckboxGroup>
                                    <div className="flex flex-row justify-end gap-2">
                                        <Button type="submit">提交</Button>
                                    </div>
                                </form>
                            ) : (
                                <EmptyState className="flex flex-col items-center gap-2">
                                    <span className="icon-[ri--inbox-2-line] text-lg" />
                                    <div className="text-sm text-muted">没有可用的订单</div>
                                </EmptyState>
                            )}
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

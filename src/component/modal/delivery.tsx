"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
    Button,
    ButtonGroup,
    Checkbox,
    Description,
    Dropdown,
    FieldError,
    Input,
    Label,
    Modal,
    Radio,
    RadioGroup,
    Tabs,
    TextArea,
    TextField,
    toast,
} from "@heroui/react";
import { ImageEncoder } from "@mmote/niimbluelib";
import clsx from "clsx";
import { AlertModal } from "@/component/common/alert";
import { usePrinter } from "@/component/weight/printer";
import { DeliveryCompany as DeliveryCompanyEnum } from "@/service/db/schema";
import {
    getAddresses,
    getSenderAddresses,
    pushDelivery,
    removeDelivery,
    saveDelivery,
    withdrawDelivery,
} from "@/service/delivery";
import { AddressResult } from "@/type/address";
import { ModalState } from "@/type/common";
import { companyMap, DeliveryCompany, DeliveryResult, iconMap } from "@/type/delivery";
import { createHelloWorldCanvas } from "@/util/print";
import { useHttp } from "@/util/request";

const DeliveryModifyModal = ({ data, isAdmin }: { data: Omit<DeliveryResult, "user">; isAdmin: boolean }) => {
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
                <Modal.Container placement="center">
                    <Modal.Dialog className="sm:max-w-2xl">
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
                                            <Tabs.Tab id="book" isDisabled={isPending}>
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
                                        {isAdmin && (
                                            <TextField
                                                fullWidth
                                                name="comment"
                                                variant="secondary"
                                                defaultValue={data.comment ?? undefined}
                                                isDisabled={isPending}
                                            >
                                                <Label>备注</Label>
                                                <TextArea />
                                            </TextField>
                                        )}
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

const DeliveryPushModal = ({ data, open, onChange }: ModalState<Omit<DeliveryResult, "user">>) => {
    const [addresses, setAddresses] = React.useState<AddressResult[]>([]);
    const [isPending, runAction] = useHttp();
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
            await pushDelivery(data.id, addressId);
        });
    };

    return (
        <Modal isOpen={open} onOpenChange={onChange}>
            <Modal.Backdrop>
                <Modal.Container placement="center">
                    <Modal.Dialog className="sm:max-w-2xl">
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

const DeliveryWithdrawModal = ({ data, open, onChange }: ModalState<Omit<DeliveryResult, "user">>) => {
    const [isPending, runAction] = useHttp();

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const reason = formData.get("reason") as string;
        runAction(async () => {
            await withdrawDelivery(data.id, reason);
        });
    };

    return (
        <Modal isOpen={open} onOpenChange={onChange}>
            <Modal.Backdrop>
                <Modal.Container placement="center">
                    <Modal.Dialog className="sm:max-w-2xl">
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

export const DeliveryModal = ({ data, isAdmin }: { data: Omit<DeliveryResult, "user">; isAdmin: boolean }) => {
    const [push, setPush] = React.useState(false);
    const [remove, setRemove] = React.useState(false);
    const [withdraw, setWithdraw] = React.useState(false);
    const router = useRouter();
    const { getClient, isPending } = usePrinter();
    const [loading, runAction] = useHttp();

    const handleClick = () => {
        runAction(
            async () => {
                const client = await getClient();
                const canvas = createHelloWorldCanvas();
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
            },
            {
                success: "测试标签已发送",
            }
        );
    };

    return (
        <>
            {data.status == "PENDING" && <DeliveryModifyModal data={data} isAdmin={isAdmin} />}
            {isAdmin && ["PENDING", "PUSHED"].includes(data.status) && (
                <Dropdown>
                    <Button isIconOnly variant="secondary">
                        <ButtonGroup.Separator />
                        <span className="icon-[ri--arrow-down-s-line]" />
                    </Button>
                    <Dropdown.Popover className="min-w-40" placement="bottom end">
                        <Dropdown.Menu>
                            {data.status == "PENDING" && (
                                <Dropdown.Item
                                    onClick={() => {
                                        if (!data.address || !data.phone || !data.recipient) {
                                            toast.danger("推送失败：当前运单信息不完善");
                                            return;
                                        }
                                        setPush(true);
                                    }}
                                >
                                    <Label>推送</Label>
                                </Dropdown.Item>
                            )}
                            <Dropdown.Item isDisabled={loading || isPending} onClick={handleClick}>
                                <Label>打印运单</Label>
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
                    <DeliveryPushModal open={push} onChange={setPush} data={data} />
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
            )}
        </>
    );
};

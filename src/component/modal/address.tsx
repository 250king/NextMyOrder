"use client";

import React from "react";
import { Button, FieldError, Input, Label, Modal, TextArea, TextField } from "@heroui/react";
import { AlertModal } from "@/component/common/alert";
import { createAddress, removeAddress, updateAddress } from "@/service/address";
import { AddressResult } from "@/type/address";
import { useHttp } from "@/util/request";

type AddressFormProps = {
    data?: AddressResult;
    isPending: boolean;
    onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
};

const AddressForm = ({ data, isPending, onSubmit }: AddressFormProps) => (
    <form className="space-y-4" autoComplete="on" onSubmit={onSubmit}>
        <TextField name="recipient" defaultValue={data?.recipient} variant="secondary" isDisabled={isPending} isRequired fullWidth>
            <Label>收件人</Label>
            <Input autoComplete="name" />
            <FieldError />
        </TextField>
        <TextField
            name="phone"
            type="tel"
            defaultValue={data?.phone}
            variant="secondary"
            pattern="^1[3-9]\\d{9}$"
            isDisabled={isPending}
            isRequired
            fullWidth
        >
            <Label>手机号</Label>
            <Input autoComplete="tel" />
            <FieldError />
        </TextField>
        <TextField name="address" defaultValue={data?.address} variant="secondary" isDisabled={isPending} isRequired fullWidth>
            <Label>详细地址</Label>
            <TextArea autoComplete="street-address" />
            <FieldError />
        </TextField>
        <div className="flex justify-end">
            <Button type="submit" isPending={isPending}>保存</Button>
        </div>
    </form>
);

export const AddressCreateModal = () => {
    const [open, setOpen] = React.useState(false);
    const [isPending, runAction] = useHttp();

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        runAction(async () => {
            await createAddress({
                recipient: String(form.get("recipient") ?? ""),
                phone: String(form.get("phone") ?? ""),
                address: String(form.get("address") ?? ""),
            });
            setOpen(false);
        }, { success: "地址已添加" });
    };

    return (
        <Modal isOpen={open} onOpenChange={setOpen}>
            <Button>
                <span className="icon-[ri--add-line]" />
                新增地址
            </Button>
            <Modal.Backdrop>
                <Modal.Container placement="center" size="lg">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header><Modal.Heading>新增地址</Modal.Heading></Modal.Header>
                        <Modal.Body className="p-2">
                            <AddressForm isPending={isPending} onSubmit={handleSubmit} />
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

export const AddressModifyModal = ({ data }: { data: AddressResult }) => {
    const [open, setOpen] = React.useState(false);
    const [isPending, runAction] = useHttp();

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        runAction(async () => {
            await updateAddress({
                id: data.id,
                recipient: String(form.get("recipient") ?? ""),
                phone: String(form.get("phone") ?? ""),
                address: String(form.get("address") ?? ""),
            });
            setOpen(false);
        }, { success: "地址已更新" });
    };

    return (
        <Modal isOpen={open} onOpenChange={setOpen}>
            <Button variant="secondary" size="sm">
                <span className="icon-[ri--edit-box-line]" />
                编辑
            </Button>
            <Modal.Backdrop>
                <Modal.Container placement="center" size="lg">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header><Modal.Heading>编辑地址</Modal.Heading></Modal.Header>
                        <Modal.Body className="p-2">
                            <AddressForm data={data} isPending={isPending} onSubmit={handleSubmit} />
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

export const AddressRemoveModal = ({ data }: { data: AddressResult }) => (
    <AlertModal
        title="删除这个地址？"
        status="danger"
        confirmLabel="删除"
        confirmVariant="danger"
        trigger={<Button variant="tertiary" size="sm">删除</Button>}
        onConfirmed={async () => {
            await removeAddress(data.id);
        }}
    >
        删除后不会影响已经填写过的分发信息，但之后将无法再次从地址簿选择该地址。
    </AlertModal>
);

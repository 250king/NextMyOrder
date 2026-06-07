"use client";

import React from "react";
import { Button, ButtonGroup, Dropdown, FieldError, Input, Label, Modal, TextField } from "@heroui/react";
import { parseZonedDateTime } from "@internationalized/date";
import { AlertModal } from "@/component/common/alert";
import { DateTimePicker } from "@/component/weight/picker";
import { changeGroupLock, createGroup, saveGroup } from "@/service/group";
import { GroupResult } from "@/type/group";
import { dataValue } from "@/util/cover";
import { useHttp } from "@/util/request";

const GroupForm = ({data, isPending, onSubmit}: {
    data?: GroupResult;
    isPending: boolean;
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
}) => {
    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            <TextField
                name="name"
                defaultValue={data?.name}
                variant="secondary"
                isDisabled={isPending}
                isRequired
                fullWidth
            >
                <Label>群名称</Label>
                <Input />
                <FieldError />
            </TextField>
            <TextField
                name="qq"
                defaultValue={data?.qq}
                isDisabled={isPending}
                variant="secondary"
                pattern="\d{5,}"
                isRequired
                fullWidth
            >
                <Label>群号</Label>
                <Input />
                <FieldError />
            </TextField>
            <TextField
                name="image"
                defaultValue={data?.image || undefined}
                isDisabled={isPending}
                variant="secondary"
                type="url"
                isRequired
                fullWidth
            >
                <Label>封面图</Label>
                <Input />
                <FieldError />
            </TextField>
            <DateTimePicker
                name="deadline"
                defaultValue={data?.deadline ? dataValue(data?.deadline): undefined}
                isDisabled={isPending}
                className="w-full"
                isRequired
                label="截止日期"
            />
            <div className="flex flex-row justify-end gap-2">
                <Button type="submit" isPending={isPending}>
                    提交
                </Button>
            </div>
        </form>
    );
}

export const GroupModifyModal = ({ data }: { data: GroupResult }) => {
    const [isPending, runAction] = useHttp();
    const [open, setOpen] = React.useState(false);

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isPending) {
            return;
        }
        const formData = new FormData(e.target);
        const name = formData.get("name") as string;
        const qq = formData.get("qq") as string;
        const image = (formData.get("image") as string) || null;
        const deadline = parseZonedDateTime(formData.get("deadline") as string).toDate();
        runAction(async () => {
            await saveGroup({
                id: data.id,
                name,
                qq,
                deadline,
                image,
            });
            setOpen(false);
        });
    };

    return (
        <>
            <AlertModal
                title={`确定${data.status == "PENDING" ? "截单" : "重新开放"}？`}
                status="warning"
                trigger={
                    <Button variant="secondary">
                        <span className={data.status == "PENDING" ? "icon-[ri--stop-fill]" : "icon-[ri--play-fill]"} />
                        {data.status == "PENDING" ? "截单" : "重新开放"}
                    </Button>
                }
                onConfirmed={async () => {
                    await changeGroupLock(data.id);
                }}
            >
                <div>
                    {data.status == "PENDING"
                        ? "截单后所有订单锁定无法修改，请确保所有订单内容无误后在进行。"
                        : "重新开放后可能会导致数据对其错误，请确保的确有需要再进行。"}
                </div>
            </AlertModal>
            <Dropdown>
                <Modal isOpen={open} onOpenChange={setOpen}>
                    <Modal.Backdrop>
                        <Modal.Container placement="center">
                            <Modal.Dialog>
                                <Modal.CloseTrigger />
                                <Modal.Header>
                                    <Modal.Heading>修改信息</Modal.Heading>
                                </Modal.Header>
                                <Modal.Body className="p-2">
                                    <GroupForm data={data} isPending={isPending} onSubmit={handleSubmit} />
                                </Modal.Body>
                            </Modal.Dialog>
                        </Modal.Container>
                    </Modal.Backdrop>
                </Modal>
                <Button isIconOnly variant="secondary">
                    <ButtonGroup.Separator />
                    <span className="icon-[ri--arrow-down-s-line]" />
                </Button>
                <Dropdown.Popover className="min-w-40" placement="bottom end">
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setOpen(true)}>
                            <Label>编辑信息</Label>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
        </>
    );
};

export const GroupCreateModal = () => {
    const [isPending, runAction] = useHttp();
    const [open, setOpen] = React.useState(false);

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isPending) {
            return;
        }
        const formData = new FormData(e.target);
        const name = formData.get("name") as string;
        const qq = formData.get("qq") as string;
        const image = (formData.get("image") as string) || null;
        const deadline = parseZonedDateTime(formData.get("deadline") as string).toDate();
        runAction(async () => {
            await createGroup({ name, qq, deadline, image });
            setOpen(false);
        })
    }

    return (
        <Modal isOpen={open} onOpenChange={setOpen}>
            <Button>新建团购</Button>
            <Modal.Backdrop>
                <Modal.Container placement="center">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>新建团购</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="p-2">
                            <GroupForm isPending={isPending} onSubmit={handleSubmit} />
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}

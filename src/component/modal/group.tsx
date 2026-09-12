"use client";
import React from "react";
import { Button, FieldError, Input, Label, Modal, TextField } from "@heroui/react";
import { parseZonedDateTime } from "@internationalized/date";
import dayjs from "dayjs";
import { AlertModal } from "@/component/common/alert";
import { DateTimePicker } from "@/component/weight/picker";
import { changeGroupLock, createGroup, finalizeGroupList, saveGroup } from "@/service/group";
import { GroupResult } from "@/type/group";
import { dataValue } from "@/util/cover";
import { useHttp } from "@/util/request";

const GroupForm = ({
    data,
    isPending,
    onSubmit,
}: {
    data?: Partial<GroupResult>;
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
                fullWidth
            >
                <Label>封面图</Label>
                <Input />
                <FieldError />
            </TextField>
            <DateTimePicker
                name="deadline"
                defaultValue={data?.deadline ? dataValue(data?.deadline) : undefined}
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
};

export const GroupListFinalizeModal = ({ data }: { data: GroupResult }) => {
    return (
        <AlertModal
            title="确认需求并生成订单？"
            status="warning"
            confirmLabel="生成订单"
            trigger={<Button>确认需求</Button>}
            onConfirmed={async () => {
                await finalizeGroupList(data.id);
            }}
        >
            确认后系统会按照当前需求生成正式订单，之后将无法自行修改商品和数量。请确认需求内容无误后再继续。
        </AlertModal>
    );
};

export const GroupLockModal = ({ data }: { data: GroupResult }) => {
    return (
        <AlertModal
            title={`确定${data.status == "PENDING" ? "截单" : "重新开放"}？`}
            status="warning"
            confirmVariant="danger"
            trigger={
                <Button className="ml-auto">
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
                    ? "截单后成员的需求将被冻结，成员可以核对需求并生成正式订单。"
                    : "重新开放后成员可以继续修改需求；若已有成员生成订单，则系统会阻止重新开放。"}
            </div>
        </AlertModal>
    );
};

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
        <Modal isOpen={open} onOpenChange={setOpen}>
            <Button variant="secondary">
                <span className="icon-[ri--edit-box-fill]" />
                编辑
            </Button>
            <Modal.Backdrop>
                <Modal.Container placement="center">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>基础信息</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="p-2">
                            <GroupForm data={data} isPending={isPending} onSubmit={handleSubmit} />
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
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
        });
    };

    return (
        <Modal isOpen={open} onOpenChange={setOpen}>
            <Button className="ml-auto">新建团购</Button>
            <Modal.Backdrop>
                <Modal.Container placement="center">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>新建团购</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="p-2">
                            <GroupForm
                                isPending={isPending}
                                onSubmit={handleSubmit}
                                data={{
                                    deadline: dayjs().add(7, "day").toDate(),
                                }}
                            />
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

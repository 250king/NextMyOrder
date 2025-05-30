"use client";
import React from "react";
import GroupForm from "@/component/form/group";
import trpc from "@/server/client";
import {usePathname, useRouter} from "next/navigation";
import {PageContainer} from "@ant-design/pro-layout";
import {App, Button, Popconfirm} from "antd";
import {GroupData} from "@/type/group";
import {TRPCClientError} from "@trpc/client";

interface Props {
    data: GroupData
    children: React.ReactNode
}

const GroupContainer = (props: Props) => {
    const message = App.useApp().message;
    const router = useRouter();
    const path = usePathname()

    return (
        <PageContainer
            title={props.data.name}
            extra={[
                <GroupForm
                    key="edit"
                    title="修改团购"
                    data={props.data}
                    target={<Button>修改</Button>}
                    onSubmit={async (values: Record<string, unknown>) => {
                        try {
                            values.id = props.data.id;
                            await trpc.group.update.mutate(values as GroupData);
                            message.success("修改成功")
                            router.replace(path);
                            return true;
                        }
                        catch {
                            message.error("发生错误，请稍后再试")
                            return false;
                        }
                    }}
                />,
                <Popconfirm
                    key="status"
                    title="提醒"
                    description={"您确定要截单？"}
                    onConfirm={async () => {
                        try {
                            await trpc.group.flow.mutate({
                                id: props.data.id,
                            });
                            message.success("修改成功");
                            router.replace(path);
                            return true;
                        }
                        catch {
                            message.error("发生错误，请稍后再试");
                            return false;
                        }
                    }}
                >
                    <Button color="primary" variant="solid" disabled={props.data.status !== "activated"}>截单</Button>
                </Popconfirm>,
                <Popconfirm
                    key="remove"
                    title="提醒"
                    description="您确定删除该团购？"
                    onConfirm={async () => {
                        try {
                            await trpc.group.delete.mutate({id: props.data.id});
                            message.success("删除成功");
                            router.replace("/group");
                            return true;
                        }
                        catch (e) {
                            if (e instanceof TRPCClientError) {
                                message.error(e.message);
                            } else {
                                message.error("发生未知错误");
                            }
                            return false;
                        }
                    }}
                >
                    <Button color="danger" variant="solid">删除</Button>
                </Popconfirm>
            ]}
        >
            {props.children}
        </PageContainer>
    );
}

export default GroupContainer;

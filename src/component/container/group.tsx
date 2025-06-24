"use client";
import React from "react";
import GroupForm from "@/component/form/group";
import JoinTable from "@/component/table/join";
import ItemTable from "@/component/table/item";
import trpc from "@/server/client";
import {App, Button, Descriptions, Popconfirm} from "antd";
import {usePathname, useRouter} from "next/navigation";
import {PageContainer} from "@ant-design/pro-layout";
import {TRPCClientError} from "@trpc/client";
import {GroupData, statusMap} from "@/type/group";

interface Props {
    data: GroupData
}

const GroupContainer = (props: Props) => {
    const [index, setIndex] = React.useState("join");
    const message = App.useApp().message;
    const router = useRouter();
    const path = usePathname()

    return (
        <PageContainer
            title={props.data.name}
            onTabChange={(key) => {
                setIndex(key);
            }}
            tabList={[
                {
                    tab: '用户',
                    key: 'join'
                },
                {
                    tab: '商品',
                    key: 'item'
                }
            ]}
            content={
                <Descriptions>
                    <Descriptions.Item label="状态">{statusMap[props.data.status as keyof typeof statusMap].text}</Descriptions.Item>
                    <Descriptions.Item label="Q群">{props.data.qq}</Descriptions.Item>
                </Descriptions>
            }
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
                <Button
                    key="summary"
                    color="primary"
                    variant="solid"
                    onClick={() => {
                        router.push(`/group/${props.data.id}/summary`);
                    }}
                >
                    汇总
                </Button>,
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
            {
                index === "join" ? (
                    <JoinTable data={props.data}/>
                ) : (
                    <ItemTable data={props.data}/>
                )
            }
        </PageContainer>
    );
}

export default GroupContainer;

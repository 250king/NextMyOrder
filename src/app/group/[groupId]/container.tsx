"use client";
import React from "react";
import ListTable from "@/component/data/list";
import ItemTable from "@/component/data/item";
import GroupForm from "@/component/form/modal/group";
import trpc from "@/server/client";
import {App, Button, Descriptions, Popconfirm} from "antd";
import {PageContainer} from "@ant-design/pro-components";
import {usePathname, useRouter} from "next/navigation";
import {GroupData, GroupSchema} from "@/type/group";
import {TRPCClientError} from "@trpc/client";

const Container = (props: {
    data: GroupSchema,
}) => {
    const [index, setIndex] = React.useState("list");
    const message = App.useApp().message;
    const router = useRouter();
    const path = usePathname();

    return (
        <PageContainer
            title={props.data.name}
            onTabChange={(key) => {
                setIndex(key);
            }}
            tabList={[
                {
                    tab: '需求表',
                    key: 'list',
                },
                {
                    tab: '商品',
                    key: 'item',
                },
            ]}
            content={
                <Descriptions>
                    <Descriptions.Item label="Q群">{props.data.qq}</Descriptions.Item>
                    <Descriptions.Item label="创建时间">{props.data.createdAt.toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="截止时间">{props.data.deadline.toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="状态">{props.data.ended? "已结束": "进行中"}</Descriptions.Item>
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
                            await trpc.groupUpdate.mutate(values as GroupData);
                            message.success("修改成功");
                            router.replace(path);
                            return true;
                        } catch {
                            message.error("发生错误，请稍后再试");
                            return false;
                        }
                    }}
                />,
                <Button
                    key="purchase"
                    color="primary"
                    variant="solid"
                    onClick={() => {
                        router.push(`/group/${props.data.id}/purchase`);
                    }}
                >
                    采购汇总
                </Button>,
                <Popconfirm
                    key="remove"
                    title="提醒"
                    description="您确定删除该团购？"
                    onConfirm={async () => {
                        try {
                            await trpc.groupDelete.mutate({
                                id: props.data.id,
                            });
                            message.success("删除成功");
                            router.replace("/group");
                            return true;
                        } catch (e) {
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
                </Popconfirm>,
            ]}
        >
            {
                index === "list" ? (
                    <ListTable data={props.data}/>
                ) : (
                    <ItemTable data={props.data}/>
                )
            }
        </PageContainer>
    );
};

export default Container;

"use client";
import React from "react";
import ItemTable from "@/component/data/item";
import ListTable from "@/component/data/list";
import trpc from "@/trpc/client";
import {PageContainer, ProDescriptions} from "@ant-design/pro-components";
import {GroupData, GroupSchema, statusMap} from "@repo/schema/group";
import {App, Button, Popconfirm} from "antd";
import {TRPCClientError} from "@trpc/client";
import {useRouter} from "next/navigation";
import Link from "next/link";

const Container = (props: {
    data: GroupSchema,
    hidden: boolean,
}) => {
    const [index, setIndex] = React.useState("list");
    const message = App.useApp().message;
    const router = useRouter();

    return (
        <PageContainer
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
                <ProDescriptions
                    request={async () => {
                        try {
                            const res = await trpc.groupGetById.query({id: props.data.id});
                            return {
                                data: res,
                                success: true,
                            };
                        } catch {
                            return {
                                data: {},
                                success: false,
                            };
                        }
                    }}
                    editable={{
                        onSave: async (_key, record) => {
                            try {
                                delete record.createdAt;
                                delete record.ended;
                                record.deadline = new Date(record.deadline).toISOString();
                                await trpc.groupUpdate.mutate(record as GroupData);
                                return true;
                            } catch (e) {
                                if (e instanceof TRPCClientError) {
                                    message.error(e.message);
                                } else {
                                    message.error("发生未知错误");
                                }
                                return false;
                            }
                        },
                    }}
                >
                    <ProDescriptions.Item dataIndex="id" title="ID" editable={false}/>
                    <ProDescriptions.Item
                        dataIndex="name"
                        title="名称"
                        editable={props.data.ended ? false : undefined}
                        formItemProps={{
                            rules: [{required: true}],
                        }}
                    />
                    <ProDescriptions.Item
                        dataIndex="qq"
                        title="QQ"
                        editable={props.data.ended ? false : undefined}
                        formItemProps={{
                            rules: [
                                {required: true},
                                {pattern: /^\d+$/, message: "QQ格式不正确"},
                            ],
                        }}
                    />
                    <ProDescriptions.Item dataIndex="createdAt" title="创建时间" valueType="dateTime" editable={false}/>
                    <ProDescriptions.Item
                        dataIndex="deadline"
                        title="截止时间"
                        valueType="dateTime"
                        editable={props.data.ended ? false : undefined}
                        formItemProps={{
                            rules: [
                                {required: true},
                            ],
                        }}
                    />
                    <ProDescriptions.Item dataIndex="ended" title="状态" valueType="select" valueEnum={statusMap} editable={false}/>
                </ProDescriptions>
            }
            extra={[
                <Link key="purchase" href={`/group/${props.data.id}/purchase`} passHref>
                    <Button color="primary" variant="solid">采购汇总</Button>
                </Link>,
                props.data.ended? null : (
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
                    </Popconfirm>
                ),
            ]}
        >
            {
                index === "list" ? (
                    <ListTable data={props.data} hidden={props.hidden}/>
                ) : (
                    <ItemTable data={props.data}/>
                )
            }
        </PageContainer>
    );
};

export default Container;

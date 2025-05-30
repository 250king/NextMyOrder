"use client"
import React from "react";
import ItemForm from "@/component/form/item";
import trpc from "@/server/client";
import {CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, LinkOutlined} from "@ant-design/icons";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {GroupData, ItemSchema, itemStatusMap} from "@/type/group";
import {PageContainer} from "@ant-design/pro-layout";
import {App, Button, Popconfirm} from "antd";
import {TRPCClientError} from "@trpc/client";

interface Props {
    data: GroupData
}

const ItemContainer = (props: Props) => {
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(null);
    const columns: ProColumns<ItemSchema>[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true
        },
        {
            title: "名称",
            dataIndex: "name",
            sorter: true,
            search: false
        },
        {
            title: "单价",
            dataIndex: "price",
            sorter: true,
            valueType: "money",
            search: false,
            fieldProps: {
                precision: 0
            }
        },
        {
            title: "重量",
            dataIndex: "weight",
            sorter: true,
            valueType: "digit",
            search: false
        },
        {
            title: "合规性",
            dataIndex: "allowed",
            sorter: true,
            valueType: "select",
            valueEnum: itemStatusMap,
            render: (_, record) => (
                record.allowed? <CheckOutlined/>: <CloseOutlined/>
            )
        },
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record, _1, action) => [
                <Button key="link" shape="circle" icon={<LinkOutlined/>} size="small" type="link" href={record.url}/>,
                <ItemForm
                    key="edit"
                    title="修改商品"
                    target={
                        <Button
                            size="small"
                            type="link"
                            icon={<EditOutlined/>}
                            disabled={props.data.status === "finished"}
                        />
                    }
                    data={record}
                    onSubmit={async (values: Record<string, unknown>) => {
                        try {
                            values.id = record.id;
                            await trpc.item.update.mutate(values as ItemSchema);
                            message.success("修改成功")
                            table.current?.reload();
                            return true;
                        }
                        catch {
                            message.error("发生错误，请稍后再试")
                            return false;
                        }
                    }}
                />,
                <Popconfirm
                    key="remove"
                    title="提醒"
                    description="您确定删除该商品？"
                    onConfirm={async () => {
                        try {
                            await trpc.item.delete.mutate({
                                id: record.id
                            });
                            message.success("删除成功");
                            action?.reload();
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
                    okText="确定"
                    cancelText="取消"
                >
                    <Button
                        size="small"
                        type="link"
                        variant="link"
                        color="danger"
                        icon={<DeleteOutlined/>}
                        disabled={props.data.status === "finished"}
                    />
                </Popconfirm>
            ]
        }
    ];

    return (
        <PageContainer>
            <ProTable<ItemSchema>
                rowKey="id"
                actionRef={table}
                columns={columns}
                search={{
                    filterType: "light"
                }}
                options={{
                    search: {
                        allowClear: true
                    }
                }}
                toolBarRender={() => [
                    <ItemForm
                        key="add"
                        title="添加商品"
                        target={<Button type="primary" disabled={props.data.status === "finished"}>添加</Button>}
                        onSubmit={async (values: Record<string, unknown>) => {
                            try {
                                values.groupId = props.data.id;
                                await trpc.item.create.mutate(values as ItemSchema);
                                message.success("添加成功");
                                table.current?.reload();
                                return true;
                            }
                            catch {
                                message.error("该商品已存在")
                                return false;
                            }
                        }}
                    />
                ]}
                request={async (params, sort) => {
                    const res = await trpc.item.get.query({
                        params: {
                            ...params,
                            groupId: props.data.id
                        },
                        sort
                    });
                    return {
                        data: res.items,
                        success: true,
                        total: res.total
                    }
                }}
            />
        </PageContainer>
    );
}

export default ItemContainer;

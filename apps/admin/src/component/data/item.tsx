"use client";
import React from "react";
import UnselectWeight from "@/component/weight/unselect";
import ItemForm from "@/component/form/modal/item";
import BaseTable from "@repo/component/base/table";
import trpc from "@/trpc/client";
import {CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, LinkOutlined} from "@ant-design/icons";
import {ModalForm, ProFormTextArea} from "@ant-design/pro-components";
import {ActionType, ProColumns} from "@ant-design/pro-table";
import {ItemData, statusMap} from "@repo/schema/item";
import {App, Button, Image, Popconfirm} from "antd";
import {GroupSchema} from "@repo/schema/group";
import {TRPCClientError} from "@trpc/client";
import {cStd, mStd} from "@repo/util/data/string";

const ItemTable = (props: {
    data: GroupSchema,
}) => {
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(null);
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true,
        },
        {
            title: "图片",
            width: 100,
            sorter: false,
            search: false,
            render: (_, record) => (
                record.image ? (
                    <Image
                        src={record.image}
                        alt={record.name}
                        referrerPolicy="no-referrer"
                        style={{width: 100, height: 100, objectFit: "cover"}}
                    />
                ) : "-"
            ),
        },
        {
            title: "名称",
            dataIndex: "name",
            sorter: true,
            search: false,
        },
        {
            title: "单价",
            dataIndex: "price",
            sorter: true,
            search: false,
            valueType: "money",
            render: (_, record) => cStd(record.price),
        },
        {
            title: "重量",
            dataIndex: "weight",
            sorter: true,
            search: false,
            valueType: "digit",
            render: (_, record) => mStd(record.weight),
        },
        {
            title: "合规性",
            dataIndex: "allowed",
            sorter: true,
            valueType: "select",
            valueEnum: statusMap,
            render: (_, record) => (
                record.allowed? <CheckOutlined/>: <CloseOutlined/>
            ),
        },
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record, _1, action) => [
                <Button key="link" shape="circle" icon={<LinkOutlined/>} size="small" type="link" target="_blank" href={record.url}/>,
                ...(props.data.ended ? [] : [
                    <ItemForm
                        key="edit"
                        title="修改商品"
                        target={<Button size="small" type="link" icon={<EditOutlined/>}/>}
                        data={record}
                        onSubmit={async (values: Record<string, unknown>) => {
                            try {
                                values.id = record.id;
                                await trpc.itemUpdate.mutate(values as ItemData);
                                message.success("修改成功");
                                table.current?.reload();
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
                    />,
                    <Popconfirm
                        key="remove"
                        title="提醒"
                        description="您确定删除该商品？"
                        onConfirm={async () => {
                            try {
                                await trpc.itemDelete.mutate({
                                    id: record.id,
                                });
                                message.success("删除成功");
                                action?.reload();
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
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button size="small" type="link" variant="link" color="danger" icon={<DeleteOutlined/>}/>
                    </Popconfirm>,
                ]),
            ],
        },
    ];

    return (
        <BaseTable
            rowKey="id"
            actionRef={table}
            columns={columns}
            rowSelection={{}}
            search={{
                filterType: "light",
            }}
            options={{
                search: {
                    allowClear: true,
                },
            }}
            tableAlertOptionRender={({selectedRowKeys, onCleanSelected}) => [
                <Popconfirm
                    key="allow"
                    title="提醒"
                    description="您确定批准选中的商品？"
                    onConfirm={async () => {
                        try {
                            await trpc.itemAllowAll.mutate({
                                ids: selectedRowKeys as number[],
                            });
                            message.success("操作成功");
                            onCleanSelected();
                            table.current?.reload();
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
                    okText="确定"
                    cancelText="取消"
                >
                    <Button type="link">批准</Button>
                </Popconfirm>,
                <UnselectWeight key="unselect" action={onCleanSelected}/>,
            ]}
            toolBarRender={() => props.data.ended ? [] :[
                <ItemForm
                    key="add"
                    title="添加商品"
                    target={<Button type="primary">添加</Button>}
                    onSubmit={async (values: Record<string, unknown>) => {
                        try {
                            values.groupId = props.data.id;
                            values.allowed = true;
                            await trpc.itemCreate.mutate(values as ItemData);
                            message.success("添加成功");
                            table.current?.reload();
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
                />,
                <ModalForm
                    key="batchAdd"
                    title="批量添加商品"
                    trigger={<Button type="primary">批量添加</Button>}
                    modalProps={{
                        destroyOnHidden: true,
                    }}
                    onFinish={async (values) => {
                        try {
                            const list = values.content.split("\n")
                                .filter((line: string) => line.trim() !== "");
                            await trpc.itemCreateAll.mutate({
                                groupId: props.data.id,
                                urls: list,
                            });
                            message.success("批量添加成功");
                            table.current?.reload();
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
                    <ProFormTextArea
                        name="content"
                        label="URL列表"
                        placeholder="每行一个URL"
                        rules={[
                            {required: true, message: "请输入URL列表"},
                            {
                                pattern: /^(https?:\/\/(?:[\w-]+\.)+[a-zA-Z]{2,}(?::\d{1,5})?(?:\/\S*)?(?:\n|$))+$/,
                                message: "URL格式有误，必须每行一个",
                            },
                        ]}
                    />
                </ModalForm>,
            ]}
            request={async (params, sort) => {
                const res = await trpc.itemGetAll.query({
                    filter: [
                        ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                        ...(params.allowed ? [{field: "allowed", operator: "eq" as const, value: params.allowed === "true"}] : []),
                        {field: "groupId", operator: "eq", value: props.data.id},
                    ],
                    search: params.keyword ?? "",
                    sort: {
                        field: Object.keys(sort).length > 0 ? Object.keys(sort)[0] : "id",
                        order: Object.values(sort)[0] === "descend"? "desc" : "asc",
                    },
                    page: {
                        size: params.pageSize,
                        current: params.current,
                    },
                });
                return {
                    data: res.items,
                    success: true,
                    total: res.total,
                };
            }}
        />
    );
};

export default ItemTable;

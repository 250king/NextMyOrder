"use client";
import React from "react";
import CheckPushTable from "@/component/form/table/check";
import UnselectWeight from "@/component/weight/unselect";
import BaseModalForm from "@/component/form/modal/base";
import trpc from "@/server/client";
import {ProColumns, ProTable, ProForm} from "@ant-design/pro-components";
import {App, Button, Image, Typography} from "antd";
import {ActionType} from "@ant-design/pro-table";
import {ItemData, ItemSchema} from "@/type/item";
import {LinkOutlined} from "@ant-design/icons";
import {ShippingSchema} from "@/type/shipping";
import {TRPCClientError} from "@trpc/client";
import {cStd} from "@/util/string";

const CheckTable = (props: {
    data: ShippingSchema,
}) => {
    const [items, setItems] = React.useState<ItemSchema[]>([]);
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
            title: "商品",
            dataIndex: "name",
            sorter: true,
            search: false,
            render: (_, record) => (
                <div>
                    <Typography>{record.name}</Typography>
                    <Typography style={{fontSize: 12}}>
                        {cStd(Number(record.price))}
                    </Typography>
                </div>
            ),
        },
        {
            title: "已确认",
            dataIndex: "confirmed",
            sorter: true,
            search: false,
            valueType: "digit",
        },
        {
            title: "待验货",
            dataIndex: "check",
            sorter: true,
            search: false,
            valueType: "digit",
        },
        {
            title: "总金额",
            dataIndex: "total",
            sorter: true,
            search: false,
            valueType: "money",
            render: (_, record) => cStd(Number(record.total)),
        },
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record) => [
                <Button key="link" icon={<LinkOutlined/>} size="small" type="link" target="_blank" href={record.url}/>,
            ],
        },
    ];

    return (
        <ProTable
            rowKey="id"
            columns={columns}
            actionRef={table}
            rowSelection={{
                onChange: (_selectedRowKeys, selectedRows) => {
                    setItems(selectedRows);
                },
            }}
            search={{
                filterType: "light",
            }}
            options={{
                search: {
                    allowClear: true,
                },
            }}
            tableAlertOptionRender={({onCleanSelected}) => [
                <BaseModalForm
                    key="push"
                    title="上报数量"
                    width="80%"
                    trigger={<Button key="send" type="link">上报</Button>}
                    initialValues={{
                        items: items,
                    }}
                    onFinish={async (record) => {
                        try {
                            await trpc.itemPush.mutate({
                                items: record.items.map((i: ItemData & {
                                    pending: number,
                                }) => ({
                                    id: i.id,
                                    count: i.pending,
                                })),
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
                >
                    <ProForm.Item name="items" trigger="onValuesChange">
                        <CheckPushTable/>
                    </ProForm.Item>
                </BaseModalForm>,
                <UnselectWeight key="unselect" action={onCleanSelected}/>,
            ]}
            request={async (params, sort) => {
                const res = await trpc.itemSummary.query({
                    filter: [
                        ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                        {field: "shippingId", operator: "eq", value: props.data.id},
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

export default CheckTable;

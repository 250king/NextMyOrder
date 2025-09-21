"use client";
import React from "react";
import trpc from "@/trpc/client";
import Link from "next/link";
import {ModalForm, ProFormMoney, ProFormSelect, ProFormText} from "@ant-design/pro-form";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {ShippingData, statusMap} from "@repo/schema/shipping";
import {SettingOutlined} from "@ant-design/icons";
import {GroupSchema} from "@repo/schema/group";
import {App, Button, Typography} from "antd";
import {TRPCClientError} from "@trpc/client";
import {cStd} from "@repo/util/data/string";

const ShippingTable = (props: {
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
            title: "运单号",
            dataIndex: "expressNumber",
            sorter: true,
            search: false,
        },
        {
            title: "运费",
            dataIndex: "fee",
            valueType: "money",
            sorter: true,
            search: false,
        },
        {
            title: "税费",
            dataIndex: "tax",
            valueType: "money",
            sorter: true,
            search: false,
        },
        {
            title: "状态",
            dataIndex: "status",
            sorter: true,
            valueEnum: statusMap,
            valueType: "select",
        },
        {
            title: "创建时间",
            dataIndex: "createAt",
            valueType: "dateTime",
            sorter: true,
            search: false,
        },
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record) => [
                <Link key="manage" href={`/group/${props.data.id}/shipping/${record.id}`} passHref>
                    <Button type="link" icon={<SettingOutlined/>}/>
                </Link>,
            ],
        },
    ];

    return (
        <ProTable
            rowKey="id"
            actionRef={table}
            columns={columns}
            search={{
                filterType: "light",
            }}
            options={{
                search: {
                    allowClear: true,
                },
            }}
            toolBarRender={() => [
                <ModalForm
                    title="添加运单"
                    key="add"
                    trigger={<Button type="primary">添加</Button>}
                    modalProps={{
                        destroyOnHidden: true,
                    }}
                    onFinish={async (values: Record<string, unknown>) => {
                        try {
                            await trpc.shippingCreate.mutate(values as ShippingData);
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
                >
                    <ProFormSelect
                        showSearch
                        mode="multiple"
                        name="itemIds"
                        label="商品"
                        debounceTime={500}
                        rules={[{required: true}]}
                        fieldProps={{
                            filterOption: false,
                            optionRender: option => (
                                <div>
                                    <Typography>{option.data.name}</Typography>
                                    <Typography style={{fontSize: 12}}>
                                        {cStd(option.data.price)}
                                    </Typography>
                                </div>
                            ),
                        }}
                        request={async (params) => {
                            const res = await trpc.itemGetAll.query({
                                filter: [
                                    {field: "groupId", operator: "eq", value: props.data.id},
                                ],
                                search: params.keyWords,
                            });
                            return res.items.map((item) => ({
                                ...item,
                                label: item.name,
                                value: item.id,
                            }));
                        }}
                    />
                    <ProFormText label="运单号" name="expressNumber" rules={[{required: true}]}/>
                    <ProFormMoney label="运费" name="fee"/>
                    <ProFormMoney label="税费" name="tax"/>
                </ModalForm>,
            ]}
            request={async (params, sort) => {
                const res = await trpc.shippingGetAll.query({
                    filter: [
                        ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                        ...(params.status ? [{field: "status", operator: "eq" as const, value: params.status}] : []),
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

export default ShippingTable;

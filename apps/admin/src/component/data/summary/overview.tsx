"use client";
import React from "react";
import ItemSelector from "@/component/form/filter/item";
import UserSelector from "@/component/form/filter/user";
import BaseTable from "@repo/component/base/table";
import trpc from "@/trpc/client";
import {ProColumns} from "@ant-design/pro-table";
import {Avatar, Space, Typography} from "antd";
import {GroupSchema} from "@repo/schema/group";
import {statusMap} from "@repo/schema/order";
import {cStd} from "@repo/util/data/string";

const OverviewTable = (props: {
    data: GroupSchema,
}) => {
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true,
        },
        {
            title: "用户",
            dataIndex: "userId",
            sorter: true,
            render: (_, record) => (
                <Space size="middle" align="center">
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${record.user.qq}&s=0`}/>
                    <div>
                        <Typography>{record.user.name}</Typography>
                        <Typography style={{fontSize: 12}}>{record.user.qq}</Typography>
                    </div>
                </Space>
            ),
            renderFormItem: () => <UserSelector/>,
        },
        {
            title: "商品",
            dataIndex: "itemId",
            sorter: true,
            render: (_, record) => (
                <div>
                    <Typography>{record.item.name}</Typography>
                    <Typography style={{fontSize: 12}}>{cStd(record.item.price)}</Typography>
                </div>
            ),
            renderFormItem: () => <ItemSelector/>,
        },
        {
            title: "数量",
            dataIndex: "count",
            sorter: true,
            valueType: "digit",
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
            dataIndex: "createdAt",
            valueType: "dateTime",
            sorter: true,
            search: false,
        },
    ];

    return (
        <BaseTable
            rowKey="id"
            columns={columns}
            request={async (params, sort) => {
                const res = await trpc.orderGetAll.query({
                    filter: [
                        ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                        ...(params.userId ? [{
                            field: "userId",
                            operator: "eq" as const,
                            value: Number(params.userId),
                        }] : []),
                        ...(params.itemId ? [{
                            field: "itemId",
                            operator: "eq" as const,
                            value: Number(params.itemId),
                        }] : []),
                        ...(params.status ? [{
                            field: "status",
                            operator: "eq" as const,
                            value: params.status,
                        }] : []),
                        {field: "item.groupId", operator: "eq", value: props.data.id},
                    ],
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

export default OverviewTable;

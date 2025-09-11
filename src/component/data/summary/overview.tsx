"use client";
import React from "react";
import ItemSelector from "@/component/form/field/item";
import UserSelector from "@/component/form/field/user";
import BaseTable from "@/component/base/table";
import trpc from "@/server/client";
import {ProColumns} from "@ant-design/pro-table";
import {Avatar, Space, Typography} from "antd";
import {statusMap} from "@/type/order";
import {GroupSchema} from "@/type/group";
import {cStd} from "@/util/string";

interface Props {
    data: GroupSchema,
}

const OverviewTable = (props: Props) => {
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
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${record.qq}&s=0`}/>
                    <div>
                        <Typography>{record.userName}</Typography>
                        <Typography style={{fontSize: 12}}>{record.qq}</Typography>
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
                    <Typography>{record.name}</Typography>
                    <Typography style={{fontSize: 12}}>{cStd(record.price)}</Typography>
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
            dataIndex: "createAt",
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
                        {field: "groupId", operator: "eq", value: props.data.id},
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

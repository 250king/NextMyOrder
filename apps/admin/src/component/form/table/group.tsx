"use client";
import React from "react";
import BaseTable from "@repo/component/base/table";
import trpc from "@/trpc/client";
import {ActionType, ProColumns} from "@ant-design/pro-components";
import {statusMap} from "@repo/schema/group";
import {Typography} from "antd";

const GroupTable = (props:{
    value?: React.Key[],
    onChange?: (value: React.Key[]) => void,

}) => {
    const table = React.useRef<ActionType>(undefined);
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true,
        },
        {
            title: "Q群",
            dataIndex: "name",
            sorter: true,
            search: false,
            render: (_, record) => (
                <div>
                    <Typography>{record.name}</Typography>
                    <Typography style={{fontSize: 12}}>{record.qq}</Typography>
                </div>
            ),
        },
        {
            title: "创建时间",
            dataIndex: "createdAt",
            valueType: "dateTime",
            sorter: true,
            search: false,
        },
        {
            title: "截止时间",
            dataIndex: "deadline",
            valueType: "dateTime",
            sorter: true,
            search: false,
        },
        {
            title: "状态",
            dataIndex: "ended",
            valueType: "select",
            sorter: true,
            valueEnum: statusMap,
        },
    ];

    return (
        <BaseTable
            rowSelection={{
                type: "radio",
                preserveSelectedRowKeys: true,
                selectedRowKeys: props.value? props.value : [],
                onChange: (selectedRowKeys) => {
                    props.onChange?.(selectedRowKeys);
                },
            }}
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

            request={async (params, sort) => {
                const res = await trpc.groupGetAll.query({
                    filter: [
                        ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                        ...(params.status ? [{field: "status", operator: "eq" as const, value: params.status}] : []),
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

export default GroupTable;

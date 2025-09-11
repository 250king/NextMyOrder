"use client";
import React from "react";
import BaseTable from "@/component/base/table";
import trpc from "@/server/client";
import {ProColumns} from "@ant-design/pro-table";
import {Space, Avatar, Typography} from "antd";

const UserTable = (props: {
    value?: React.Key[],
    onChange?: (value: React.Key[]) => void,
    groupId?: number,
}) => {
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true,
        },
        {
            title: "QQ",
            dataIndex: "qq",
            sorter: true,
            search: false,
            render: (_, record) => (
                <Space size="middle" align="center">
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${record.qq}&s=0`}/>
                    <div>
                        <Typography>{record.name}</Typography>
                        <Typography style={{fontSize: 12}}>{record.qq}</Typography>
                    </div>
                </Space>
            ),
        },
        {
            title: "邮箱",
            dataIndex: "email",
            sorter: true,
            search: false,
        },
    ];

    return (
        <BaseTable
            columns={columns}
            rowSelection={{
                type: "checkbox",
                preserveSelectedRowKeys: true,
                selectedRowKeys: props.value? props.value : [],
                onChange: (selectedRowKeys) => {
                    props.onChange?.(selectedRowKeys);
                },
            }}
            request={async (params, sort) => {
                const res = await trpc.userGetAll.query({
                    filter: [
                        ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                        ...(props.groupId ? [{field: "lists.none.groupId", operator: "eq" as const, value: props.groupId}] : []),
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

export default UserTable;

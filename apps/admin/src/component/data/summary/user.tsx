"use client";
import React from "react";
import BaseTable from "@repo/component/base/table";
import trpc from "@/trpc/client";
import {ProColumns} from "@ant-design/pro-table";
import {Avatar, Space, Typography} from "antd";
import {GroupSchema} from "@repo/schema/group";
import {cStd} from "@repo/util/data/string";

const UserTable = (props: {
    data: GroupSchema,
}) => {
    const columns: ProColumns[] = [
        {title: "ID", dataIndex: "id", sorter: true},
        {
            title: "QQ",
            dataIndex: "name",
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
            title: "汇总",
            dataIndex: "total",
            valueType: "money",
            sorter: true,
            search: false,
            render: (_, record) => cStd(record.total),
        },
    ];

    return (
        <BaseTable
            rowKey="id"
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
                const res = await trpc.userSummary.query({
                    filter: [
                        ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
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

export default UserTable;

"use client";
import React from "react";
import BaseTable from "@/component/base/table";
import trpc from "@/server/client";
import {ProColumns} from "@ant-design/pro-table";
import {Avatar, Space, Typography} from "antd";
import {ShippingSchema} from "@/type/shipping";
import {mStd, rStd} from "@/util/string";

const FeeTable = (props: {
    data: ShippingSchema,
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
            sorter: true,
            search: false,
            render: (_, record) => mStd(record.total),
        },
        {
            title: "占比",
            dataIndex: "ratio",
            valueType: "percent",
            sorter: false,
            search: false,
            render: (_, record) => rStd(record.ratio),
        },
        {
            title: "运费",
            dataIndex: "fee",
            valueType: "money",
            sorter: true,
            search: false,
        },
    ];

    return (
        <BaseTable
            rowKey="id"
            columns={columns}
            request={async (params, sort) => {
                const res = await trpc.weightSummary.query({
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

export default FeeTable;

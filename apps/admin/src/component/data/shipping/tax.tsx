"use client";
import React from "react";
import BaseTable from "@repo/component/base/table";
import trpc from "@/trpc/client";
import {ShippingSchema} from "@repo/schema/shipping";
import {ProColumns} from "@ant-design/pro-table";
import {Avatar, Space, Typography} from "antd";
import {cStd, rStd} from "@repo/util/data/string";

const TaxTable = (props: {
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
            valueType: "money",
            sorter: true,
            search: false,
            render: (_, record) => cStd(record.total),
        },
        {
            title: "占比",
            dataIndex: "ratio",
            valueType: "percent",
            search: false,
            render: (_, record) => rStd(record.ratio),
        },
        {
            title: "税费",
            dataIndex: "tax",
            valueType: "money",
            search: false,
        },
    ];

    return (
        <BaseTable
            rowKey="id"
            columns={columns}
            request={async (params, sort) => {
                const res = await trpc.taxSummary.query({
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

export default TaxTable;

"use client";
import React from "react";
import BaseTable from "@repo/component/base/table";
import trpc from "@/trpc/client";
import Link from "next/link";
import {SettingOutlined} from "@ant-design/icons";
import {ProColumns} from "@ant-design/pro-table";
import {statusMap} from "@repo/schema/shipping";
import {Button} from "antd";

const ShippingTable = (props:{
    value?: React.Key[],
    onChange?: (value: React.Key[]) => void,
}) => {

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
            title: "税费",
            dataIndex: "tax",
            sorter: true,
            search: false,
        },
        {
            title: "运费",
            dataIndex: "fee",
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
            dataIndex: "createdAt",
            valueType: "dateTime",
            sorter: true,
            search: false,
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
            columns={columns}
            request={async (params, sort) => {
                const res = await trpc.shippingGetAll.query({
                    filter: params.id? [{field: "id", operator: "eq", value: Number(params.id)}] : [],
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

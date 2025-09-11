"use client";
import React from "react";
import GroupSelector from "@/component/form/field/group";
import BaseTable from "@/component/base/table";
import trpc from "@/server/client";
import {ProColumns} from "@ant-design/pro-table";
import {Image, Typography} from "antd";
import {cStd} from "@/util/string";

const ItemTable = (props: {
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
            title: "商品名",
            dataIndex: "name",
            sorter: true,
            search: false,
            render: (_, record) => (
                <div>
                    <Typography>{record.name}</Typography>
                    <Typography style={{fontSize: 12}}>{cStd(record.price)}</Typography>
                </div>
            ),
        },
        {
            title: "团购",
            dataIndex: "groupId",
            sorter: true,
            renderFormItem: () => <GroupSelector hiddenEnded={true}/>,
            render: (_, record) => (
                <div>
                    <Typography>{record.group.name}</Typography>
                    <Typography style={{fontSize: 12}}>{record.group.qq}</Typography>
                </div>
            ),
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
                const res = await trpc.itemGetAll.query({
                    filter: [
                        ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                        ...(params.groupId ? [{field: "groupId", operator: "eq" as const, value: Number(params.groupId)}] : []),
                        {field: "shippingId", operator: "eq", value: null},
                        {field: "allowed", operator: "eq", value: true},
                        {field: "group.ended", operator: "eq", value: false},
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

export default ItemTable;

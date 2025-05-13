"use client";

import {ProColumns, ProTable} from "@ant-design/pro-table";
import {Typography} from "antd";
import React from "react";

interface Props {
    data: Record<string, unknown>[] | undefined
}

const ItemTable = (props: Props) => {
    const columns: ProColumns[] = [
        {title: "ID", dataIndex: "id", sorter: (a, b) => a.id - b.id},
        {
            title: "商品",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (_, record) => (
                <div>
                    <Typography>{record.name}</Typography>
                    <Typography style={{fontSize: 12}}>
                        {Intl.NumberFormat("ja-JP", {style: "currency", currency: "JPY"}).format(Number(record.price))}
                    </Typography>
                </div>
            )
        },
        {title: "数量", dataIndex: "count", sorter: (a, b) => a.count - b.count, valueType: "digit"},
        {
            title: "汇总",
            dataIndex: "total",
            sorter: (a, b) => a.total - b.total,
            valueType: "money",
            fieldProps: {
                precision: 0
            }
        }
    ];

    return (
        <ProTable rowKey="id" options={{reload: false}} dataSource={props.data} columns={columns} search={false}/>
    );
}

export default ItemTable;

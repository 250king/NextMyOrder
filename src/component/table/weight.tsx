"use client";
import React from "react";
import {Avatar, Space, Typography} from "antd";
import {ProColumns, ProTable} from "@ant-design/pro-table";
import {Weight} from "@/type/summary";

interface Props {
    data: Weight[] | undefined
}

const WeightTable = (props: Props) => {
    const columns: ProColumns[] = [
        {title: "ID", dataIndex: "id", sorter: (a, b) => a.id - b.id},
        {
            title: "QQ",
            dataIndex: "qq",
            sorter: (a, b) => Number(a.qq) - Number(b.qq),
            render: (_, record) => (
                <Space size="middle" align="center">
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${record.qq}&s=0`}/>
                    <div>
                        <Typography>{record.name}</Typography>
                        <Typography style={{fontSize: 12}}>{record.qq}</Typography>
                    </div>
                </Space>
            )
        },
        {
            title: "总重",
            dataIndex: "total",
            sorter: (a, b) => a.total - b.total,
            valueType: "digit",
            fieldProps: {
                precision: 0
            }
        },
        {title: "占比", dataIndex: "ratio", sorter: (a, b) => a.ratio - b.ratio, valueType: "percent"},
    ];

    return (
        <ProTable rowKey="id" options={{reload: false}} dataSource={props.data} columns={columns} search={false}/>
    );
}

export default WeightTable;

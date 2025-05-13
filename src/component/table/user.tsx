"use client";
import React from "react";
import {ProColumns, ProTable} from "@ant-design/pro-table";
import {User} from "@/type/summary";
import {Avatar, Space, Typography} from "antd";

interface Props {
    data?: User[]
}

const UserTable = (props: Props) => {
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

export default UserTable;

"use client";
import React from "react";
import JoinForm from "@/component/form/join";
import trpc from "@/server/client";
import Link from "next/link";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {Avatar, Button, Space, Typography} from "antd";
import {SettingOutlined} from "@ant-design/icons";
import {SortOrder} from "antd/es/table/interface";
import {GroupData, JoinData} from "@/type/group";

interface Props {
    data: GroupData
}

const JoinTable = (props: Props) => {
    const table = React.useRef<ActionType>(undefined);
    const columns: ProColumns<JoinData>[] = [
        {
            title: "ID",
            dataIndex: "userId",
            sorter: true
        },
        {
            title: "QQ",
            dataIndex: [
                "user",
                "qq"
            ],
            sorter: true,
            search: false,
            render: (_, record) => (
                <Space size="middle" align="center">
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${record.user.qq}&s=0`}/>
                    <div>
                        <Typography>{record.user.name}</Typography>
                        <Typography style={{fontSize: 12}}>{record.user.qq}</Typography>
                    </div>
                </Space>
            )
        },
        {
            title: "邮箱",
            dataIndex: [
                "user",
                "email"
            ],
            sorter: true,
            search: false
        },
        {
            title: "加入时间",
            dataIndex: "createAt",
            valueType: "dateTime",
            sorter: true,
            search: false
        },
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record) => [
                <Link key="manage" href={`/group/${record.groupId}/user/${record.userId}`} passHref>
                    <Button type="link" icon={<SettingOutlined/>}/>
                </Link>
            ]
        }
    ];

    return (
        <ProTable<JoinData>
            rowKey="userId"
            actionRef={table}
            columns={columns}
            search={{
                filterType: "light"
            }}
            options={{
                search: {
                    allowClear: true
                }
            }}
            toolBarRender={() => [
                <JoinForm key={"create"} table={table.current} data={props.data}/>
            ]}
            request={async (params, sort) => {
                const field: Record<string, SortOrder> = {"userId": "ascend"}
                const res = await trpc.group.user.get.query({
                    params,
                    sort: Object.keys(sort).length === 0 ? field : sort,
                    groupId: props.data.id
                });
                return {data: res.items as never, success: true, total: res.total}
            }}
        />
    );
}

export default JoinTable

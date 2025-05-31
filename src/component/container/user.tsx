"use client";
import React from "react";
import trpc from "@/server/client";
import JoinForm from "@/component/form/join";
import {App, Avatar, Button, Popconfirm, Space, Typography} from "antd";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {DisconnectOutlined} from "@ant-design/icons";
import {PageContainer} from "@ant-design/pro-layout";
import {SortOrder} from "antd/es/table/interface";
import {GroupData, JoinData} from "@/type/group";
import {TRPCClientError} from "@trpc/client";

interface Props {
    data: GroupData
}

const JoinContainer = (props: Props) => {
    const message = App.useApp().message;
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
            render: (_, record, _1, action) => [
                <Popconfirm
                    key={0}
                    title="提醒"
                    description="您确定移除该用户？"
                    onConfirm={async () => {
                        try {
                            await trpc.group.user.delete.mutate({
                                groupId: record.groupId,
                                userId: record.userId
                            });
                            message.success("移除成功");
                            action?.reload();
                            return true;
                        } catch (e) {
                            if (e instanceof TRPCClientError) {
                                message.error(e.message);
                            } else {
                                message.error("发生未知错误");
                            }
                            return false;
                        }
                    }}
                >
                    <Button
                        type="link"
                        variant="link"
                        color="danger"
                        icon={<DisconnectOutlined/>}
                        disabled={props.data.status === "finished"}
                    />
                </Popconfirm>
            ]
        }
    ];

    return (
        <PageContainer>
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
        </PageContainer>
    );
}

export default JoinContainer

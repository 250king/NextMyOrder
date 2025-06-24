"use client";
import React from "react";
import trpc from "@/server/client";
import UserForm from "@/component/form/user";
import {Space, Avatar, Typography, Popconfirm, App, Button} from "antd";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {PageContainer} from "@ant-design/pro-layout";
import {TRPCClientError} from "@trpc/client";
import {UserSchema} from "@/type/user";

const Page = () => {
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(null);
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true
        },
        {
            title: "QQ",
            dataIndex: "qq",
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
            )
        },
        {
            title: "邮箱",
            dataIndex: "email",
            sorter: true,
            search: false
        },
        {
            title: "注册时间",
            dataIndex: "createAt",
            valueType: "dateTime",
            sorter: true,
            search: false
        },
        {
            title: '操作',
            valueType: 'option',
            width: 150,
            render: (_, record, _1, action) => [
                <UserForm
                    key="edit"
                    data={record}
                    title="修改用户"
                    target={<Button type="link" icon={<EditOutlined/>}/>}
                    onSubmit={async (values: Record<string, unknown>) => {
                        try {
                            values.id = record.id;
                            await trpc.user.update.mutate(values as UserSchema);
                            message.success("修改成功");
                            action?.reload();
                            return true;
                        } catch {
                            message.error("发生错误，请稍后再试");
                            return false;
                        }
                    }}
                />,
                <Popconfirm
                    key="delete"
                    title="提醒"
                    description="您确定删除该用户？"
                    onConfirm={async () => {
                        try {
                            await trpc.user.delete.mutate({
                                id: record.id
                            });
                            message.success("删除成功");
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
                    <Button type="link" variant="link" color="danger" icon={<DeleteOutlined/>}/>
                </Popconfirm>
            ],
        }
    ];

    return (
        <PageContainer>
            <ProTable
                rowKey="id"
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
                    <UserForm
                        key="add"
                        title={"添加用户"}
                        target={<Button type="primary">添加</Button>}
                        onSubmit={async (values: Record<string, unknown>) => {
                            try {
                                await trpc.user.add.mutate(values as UserSchema);
                                message.success("添加成功");
                                table.current?.reload();
                                return true;
                            } catch {
                                message.error("该用户已存在");
                                return false;
                            }
                        }}
                    />
                ]}
                request={async (params, sort) => {
                    const res = await trpc.user.get.query({
                        params, sort
                    });
                    return {
                        data: res.items,
                        success: true,
                        total: res.total
                    };
                }}
            />
        </PageContainer>
    );
}

export default Page;

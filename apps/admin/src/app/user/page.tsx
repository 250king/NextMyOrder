"use client";
import React from "react";
import UserForm from "@/component/form/modal/user";
import BaseTable from "@repo/component/base/table";
import trpc from "@/trpc/client";
import Link from "next/link";
import {ModalForm, ProFormTextArea} from "@ant-design/pro-components";
import {ActionType, ProColumns} from "@ant-design/pro-table";
import {Space, Avatar, Typography, App, Button} from "antd";
import {PageContainer} from "@ant-design/pro-components";
import {SettingOutlined} from "@ant-design/icons";
import {TRPCClientError} from "@trpc/client";
import {UserData} from "@repo/schema/user";

const Page = () => {
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(null);
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true,
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
            ),
        },
        {
            title: "邮箱",
            dataIndex: "email",
            sorter: true,
            search: false,
        },
        {
            title: "注册时间",
            dataIndex: "createdAt",
            valueType: "dateTime",
            sorter: true,
            search: false,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 150,
            render: (_, record) => [
                <Link key="manage" href={`/user/${record.id}`} passHref>
                    <Button type="link" icon={<SettingOutlined/>}/>
                </Link>,
            ],
        },
    ];

    return (
        <PageContainer>
            <BaseTable
                actionRef={table}
                columns={columns}
                toolBarRender={() => [
                    <UserForm
                        key="add"
                        title="添加用户"
                        target={<Button type="primary">添加</Button>}
                        onSubmit={async (values: Record<string, unknown>) => {
                            try {
                                await trpc.userCreate.mutate(values as UserData);
                                message.success("添加成功");
                                table.current?.reload();
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
                    />,
                    <ModalForm
                        key="batchAdd"
                        title="批量添加用户"
                        trigger={<Button type="primary">批量添加</Button>}
                        modalProps={{
                            destroyOnHidden: true,
                        }}
                        onFinish={async (values) => {
                            try {
                                const list = values.content.split("\n")
                                    .filter((line: string) => line.trim() !== "")
                                    .map(Number);
                                await trpc.userCreateAll.mutate({
                                    qqs: list,
                                });
                                message.success("批量添加成功");
                                table.current?.reload();
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
                        <ProFormTextArea
                            name="content"
                            label="QQ号列表"
                            placeholder="每行一个QQ号"
                            rules={[
                                {required: true, message: "请输入QQ号列表"},
                                {pattern: /^(\d+\n?)+$/, message: "QQ号格式有误，必须为数字，每行一个"},
                            ]}
                        />
                    </ModalForm>,
                ]}
                request={async (params, sort) => {
                    const res = await trpc.userGetAll.query({
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
        </PageContainer>
    );
};

export default Page;

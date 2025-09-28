"use client";
import React from "react";
import BaseModalForm from "@repo/component/base/modal";
import UserTable from "@/component/form/table/user";
import BaseTable from "@repo/component/base/table";
import trpc from "@/trpc/client";
import Link from "next/link";
import {CheckOutlined, CloseOutlined, SettingOutlined} from "@ant-design/icons";
import {App, Avatar, Button, Form, Popconfirm, Space, Typography} from "antd";
import {confirmMap, finishedMap, ListData} from "@repo/schema/list";
import {ActionType, ProColumns} from "@ant-design/pro-table";
import {GroupSchema} from "@repo/schema/group";
import {TRPCClientError} from "@trpc/client";

const ListTable = (props: {
    data: GroupSchema,
    hidden: boolean,
}) => {
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(null);
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true,
        },
        {
            title: "用户",
            dataIndex: "userId",
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
            ),
        },
        {
            title: "创建时间",
            dataIndex: "createdAt",
            valueType: "dateTime",
            sorter: true,
            search: false,
        },
        {
            title: "确认情况",
            dataIndex: "confirmed",
            sorter: true,
            valueType: "select",
            valueEnum: confirmMap,
            render: (_, record) => (
                record.confirmed? <CheckOutlined/>: <CloseOutlined/>
            ),
        },
        {
            title: "完成情况",
            dataIndex: "finished",
            sorter: true,
            valueType: "select",
            valueEnum: finishedMap,
            render: (_, record) => (
                record.finished? <CheckOutlined/>: <CloseOutlined/>
            ),
        },
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record) => [
                <Link key="manage" href={`/group/${props.data.id}/list/${record.id}`} passHref>
                    <Button type="link" icon={<SettingOutlined/>}/>
                </Link>,
            ],
        },
    ];

    return (
        <BaseTable
            actionRef={table}
            columns={columns}
            toolBarRender={() => props.data.ended ? [] : [
                props.hidden ? null : (
                    <Popconfirm
                        key="confirm"
                        title="提醒"
                        description="您确定向全团人员发送确认邮件？"
                        onConfirm={async () => {
                            try {
                                const res = await trpc.listSendEmailAll.mutate({
                                    groupId: props.data.id,
                                });
                                message.success(`成功发送${res.total}封邮件`);
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
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="primary">发送邮件</Button>
                    </Popconfirm>
                ),
                <BaseModalForm
                    key="add"
                    title="添加用户"
                    width="80%"
                    trigger={<Button type="primary">添加</Button>}
                    onFinish={async (values: Record<string, unknown>) => {
                        try {
                            values.groupId = props.data.id;
                            const res = await trpc.listCreateAll.mutate(values as ListData);
                            message.success(`${res.total}项添加成功`);
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
                    <Form.Item name="userIds" rules={[{required: true, message: "请选择用户"}]}>
                        <UserTable/>
                    </Form.Item>
                </BaseModalForm>,
            ]}
            request={async (params, sort) => {
                const res = await trpc.listGetAll.query({
                    filter: [
                        {field: "groupId", operator: "eq", value: props.data.id},
                        ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                        ...(params.finished ? [{field: "finished", operator: "eq" as const, value: params.finished === "true"}] : []),
                        ...(params.confirmed ? [{field: "confirmed", operator: "eq" as const, value: params.confirmed === "true"}] : []),
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

export default ListTable;

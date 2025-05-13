"use client";
import React from "react";
import UserForm from "@/component/form/user";
import {Space, Avatar, Typography, Popconfirm, App, Button} from "antd";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {PageContainer} from "@ant-design/pro-layout";
import {queryBuilder} from "@/util/http/query";
import {User} from "@prisma/client";
import $ from "@/util/http/api";

const Page = () => {
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(undefined);
    const [disabled, setDisabled] = React.useState(false);
    const columns: ProColumns<User>[] = [
        {title: "ID", dataIndex: "id", sorter: true},
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
        {title: "邮箱", dataIndex: "email", sorter: true, search: false},
        {title: "注册时间", dataIndex: "createAt", valueType: "dateTime", sorter: true, search: false},
        {
            title: '操作',
            valueType: 'option',
            width: 150,
            render: (_, record, _1, action) => [
                <UserForm
                    key={"edit"}
                    data={record}
                    title="修改用户"
                    target={<a>修改</a>}
                    onSubmit={async (values: Record<string, never>) => {
                        try {
                            await $.patch(`/user/${record.id}`, values);
                            message.success("修改成功");
                            action?.reload();
                            return true;
                        }
                        catch {
                            message.error("发生错误，请稍后再试");
                            return false;
                        }
                    }}
                />,
                <Popconfirm
                    key={"delete"}
                    title="提醒"
                    description="您确定删除该用户？"
                    onConfirm={async () => {
                        try {
                            await $.delete(`/user/${record.id}`)
                            message.success("删除成功");
                            action?.reload();
                            return true;
                        }
                        catch {
                            message.error("发生错误，请稍后再试");
                            return false;
                        }
                    }}
                >
                    <a>删除</a>
                </Popconfirm>
            ],
        }
    ];

    return (
        <PageContainer>
            <ProTable<User>
                rowKey="id"
                actionRef={table}
                columns={columns}
                search={{filterType: "light"}}
                onLoadingChange={loading => setDisabled(loading === true)}
                options={{search: {allowClear: true}}}
                toolBarRender={() => [
                    <UserForm
                        key={"add"}
                        title={"添加用户"}
                        target={<Button type="primary" disabled={disabled}>添加</Button>}
                        onSubmit={async (values: Record<string, never>) => {
                            try {
                                await $.post("/user", values);
                                message.success("添加成功");
                                table.current?.reload();
                                return true;
                            }
                            catch {
                                message.error("该用户已存在");
                                return false;
                            }
                        }}
                    />
                ]}
                request={async (params, sort) => {
                    const query = queryBuilder(params, sort);
                    const res = await $.get("/user", {params: query});
                    const data = await res.data;
                    return {data: data.items, success: res.status === 200, total: data.total};
                }}
            />
        </PageContainer>
    );
}

export default Page;

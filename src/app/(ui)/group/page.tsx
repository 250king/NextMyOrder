"use client";
import React from "react";
import GroupForm from "@/component/form/group";
import Link from "next/link";
import $ from "@/util/http/api";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {Typography, Button, App, Popconfirm} from "antd";
import {PageContainer} from "@ant-design/pro-layout";
import {queryBuilder} from "@/util/http/query";
import {statusMap} from "@/type/group";
import {Group} from "@prisma/client";

const Page = () => {
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(undefined);
    const columns: ProColumns<Group>[] = [
        {title: "ID", dataIndex: "id", sorter: true},
        {
            title: "Q群",
            dataIndex: "qq",
            sorter: true,
            search: false,
            render: (_, record) => (
                <div>
                    <Typography>{record.name}</Typography>
                    <Typography style={{fontSize: 12}}>{record.qq}</Typography>
                </div>
            )
        },
        {title: "创建时间", dataIndex: "createAt", valueType: "dateTime", sorter: true, search: false},
        {title: "状态", dataIndex: "status", valueType: "select", sorter: true, valueEnum: statusMap},
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record, _1, action) => [
                <Link href={`/group/${record.id}`} key={"manage"}>管理</Link>,
                <GroupForm
                    key={"edit"}
                    title="修改团购"
                    data={record}
                    target={<a>修改</a>}
                    onSubmit={async (values: Record<string, never>) => {
                        try {
                            await $.patch(`/group/${record.id}`, values)
                            message.success("修改成功")
                            table.current?.reload();
                            return true;
                        }
                        catch {
                            message.error("发生错误，请稍后再试")
                            return false;
                        }
                    }}
                />,
                <Popconfirm
                    key={"remove"}
                    title="提醒"
                    description="您确定删除该团购？"
                    onConfirm={async () => {
                        try {
                            await $.delete(`/group/${record.id}`)
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
            ]
        }
    ];

    return (
        <PageContainer>
            <ProTable<Group>
                rowKey="id"
                actionRef={table}
                columns={columns}
                search={{filterType: "light"}}
                options={{search: {allowClear: true}}}
                toolBarRender={() => [
                    <GroupForm
                        key={"add"}
                        title="添加团购"
                        target={<Button type="primary">添加</Button>}
                        onSubmit={async (values: Record<string, never>) => {
                            try {
                                await $.post("/group", values)
                                message.success("添加成功")
                                table.current?.reload();
                                return true;
                            }
                            catch {
                                message.error("发生错误，请稍后再试")
                                return false;
                            }
                        }}
                    />
                ]}
                request={async (params, sort,) => {
                    const query = queryBuilder(params, sort)
                    const res = await $.get(`/group`, {params: query});
                    const data = res.data;
                    return {data: data.items, success: res.status === 200, total: data.total}
                }}
            />
        </PageContainer>
    );
}

export default Page;

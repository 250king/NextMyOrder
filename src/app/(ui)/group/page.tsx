"use client";
import React from "react";
import GroupForm from "@/component/form/group";
import trpc from "@/server/client";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {GroupSchema, groupStatusMap} from "@/type/group";
import {PageContainer} from "@ant-design/pro-layout";
import {SettingOutlined} from "@ant-design/icons";
import {Typography, Button, App} from "antd";
import Link from "next/link";

const Page = () => {
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(undefined);
    const columns: ProColumns<GroupSchema>[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true},
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
        {
            title: "创建时间",
            dataIndex: "createAt",
            valueType: "dateTime",
            sorter: true,
            search: false
        },
        {
            title: "状态",
            dataIndex: "status",
            valueType: "select",
            sorter: true,
            valueEnum: groupStatusMap
        },
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record) => [
                <Link key="manage" href={`/group/${record.id}`} passHref>
                    <Button type="link" icon={<SettingOutlined/>}/>
                </Link>
            ]
        }
    ];

    return (
        <PageContainer>
            <ProTable<GroupSchema>
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
                    <GroupForm
                        key={"add"}
                        title="添加团购"
                        target={<Button type="primary">添加</Button>}
                        onSubmit={async (values: Record<string, unknown>) => {
                            try {
                                await trpc.group.create.mutate(values as GroupSchema);
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
                request={async (params, sort) => {
                    const res = await trpc.group.get.query({
                        params, sort
                    });
                    return {
                        data: res.items,
                        success: true,
                        total: res.total
                    }
                }}
            />
        </PageContainer>
    );
}

export default Page;

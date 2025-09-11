"use client";
import React from "react";
import GroupForm from "@/component/form/modal/group";
import trpc from "@/server/client";
import Link from "next/link";
import {ActionType, ProColumns} from "@ant-design/pro-table";
import {PageContainer} from "@ant-design/pro-layout";
import {SettingOutlined} from "@ant-design/icons";
import {Typography, Button, App} from "antd";
import {TRPCClientError} from "@trpc/client";
import {GroupData, statusMap} from "@/type/group";
import BaseTable from "@/component/base/table";

const Page = () => {
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(undefined);
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true,
        },
        {
            title: "Q群",
            dataIndex: "name",
            sorter: true,
            search: false,
            render: (_, record) => (
                <div>
                    <Typography>{record.name}</Typography>
                    <Typography style={{fontSize: 12}}>{record.qq}</Typography>
                </div>
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
            title: "截止时间",
            dataIndex: "deadline",
            valueType: "dateTime",
            sorter: true,
            search: false,
        },
        {
            title: "状态",
            dataIndex: "ended",
            valueType: "select",
            sorter: true,
            valueEnum: statusMap,
        },
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record) => [
                <Link key="manage" href={`/group/${record.id}`} passHref>
                    <Button type="link" icon={<SettingOutlined/>}/>
                </Link>,
            ],
        },
    ];

    return (
        <PageContainer>
            <BaseTable
                rowKey="id"
                actionRef={table}
                columns={columns}
                search={{
                    filterType: "light",
                }}
                options={{
                    search: {
                        allowClear: true,
                    },
                }}
                toolBarRender={() => [
                    <GroupForm
                        key="add"
                        title="添加团购"
                        target={<Button type="primary">添加</Button>}
                        onSubmit={async (values: Record<string, unknown>) => {
                            try {
                                await trpc.groupCreate.mutate(values as GroupData);
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
                ]}
                request={async (params, sort) => {
                    const res = await trpc.groupGetAll.query({
                        filter: [
                            ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                            ...(params.status ? [{field: "status", operator: "eq" as const, value: params.status}] : []),
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
        </PageContainer>
    );
};

export default Page;

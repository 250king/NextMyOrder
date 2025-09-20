"use client";
import React from "react";
import UserSelector from "@/component/form/filter/user";
import BaseTable from "@repo/component/base/table";
import trpc from "@/trpc/client";
import Link from "next/link";
import {App, Avatar, Button, Popconfirm, Space, Typography} from "antd";
import {ActionType, ProColumns} from "@ant-design/pro-table";
import {companyMap, statusMap} from "@repo/schema/delivery";
import {PageContainer} from "@ant-design/pro-layout";
import {SettingOutlined} from "@ant-design/icons";
import {TRPCClientError} from "@trpc/client";

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
            title: "收件人",
            dataIndex: "userId",
            sorter: true,
            search: false,
            render: (_, record) => (
                <Space size="middle" align="center">
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${record.user.qq}&s=0`}/>
                    <div>
                        <Typography>{record.name}</Typography>
                        <Typography style={{fontSize: 12}}>{record.user.qq}</Typography>
                    </div>
                </Space>
            ),
            renderFormItem: () => <UserSelector/>,
        },
        {
            title: "手机号码",
            dataIndex: "phone",
            sorter: true,
            search: false,
        },
        {
            title: "地址",
            dataIndex: "address",
            search: false,
        },
        {
            title: "快递公司",
            dataIndex: "company",
            sorter: true,
            valueType: "select",
            valueEnum: companyMap,
        },
        {
            title: "快递单号",
            dataIndex: "expressNumber",
        },
        {
            title: "状态",
            dataIndex: "status",
            sorter: true,
            valueType: "select",
            valueEnum: statusMap,
        },
        {
            title: "创建时间",
            dataIndex: "createdAt",
            valueType: "dateTime",
            sorter: true,
            search: false,
        },
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record) => [
                <Link key="manage" href={`/delivery/${record.id}`} passHref>
                    <Button type="link" icon={<SettingOutlined/>}/>
                </Link>,
            ],
        },
    ];

    return (
        <PageContainer>
            <BaseTable
                rowKey="id"
                rowSelection={{
                    preserveSelectedRowKeys: true,
                }}
                actionRef={table}
                columns={columns}
                search={{filterType: "light"}}
                options={{search: {allowClear: true}}}
                tableAlertOptionRender={({selectedRowKeys}) => [
                    <Popconfirm
                        key="remove"
                        title="提醒"
                        description="您确定推送运单到快递公司？"
                        onConfirm={async () => {
                            try {
                                await trpc.deliveryPush.mutate({
                                    ids: selectedRowKeys.map((id) => Number(id)),
                                });
                                message.success("推送成功，请注意回调通知");
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
                        <Button type="link">推送运单</Button>
                    </Popconfirm>,
                    <Popconfirm
                        key="send"
                        title="提醒"
                        description="您确定发送邮件给用户？"
                        onConfirm={async () => {
                            try {
                                await trpc.deliverySendTicket.mutate({
                                    ids: selectedRowKeys.map((id) => Number(id)),
                                });
                                message.success("发送成功");
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
                        <Button type="link">发送邮件</Button>
                    </Popconfirm>,
                    <Button key="cancle" type="link" onClick={() => table.current?.clearSelected?.()}>取消选择</Button>,
                ]}
                toolBarRender={() => [
                    <Link key="add" href="/delivery/create" passHref>
                        <Button type="primary">添加</Button>
                    </Link>,
                ]}
                request={async (params, sort) => {
                    const res = await trpc.deliveryGetAll.query({
                        filter: [
                            ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                            ...(params.company ? [{field: "company", operator: "eq" as const, value: params.company}] : []),
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

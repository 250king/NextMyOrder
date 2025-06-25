"use client";
import React from "react";
import trpc from "@/server/client";
import Link from "next/link";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {CloseOutlined, DeleteOutlined, EditOutlined, MessageOutlined} from "@ant-design/icons";
import {DeliveryData, DeliverySchema, methodMap, statusMap} from "@/type/delivery";
import {ModalForm, ProFormText, ProFormTextArea} from "@ant-design/pro-form";
import {App, Avatar, Button, Form, Popconfirm, Popover} from "antd";
import {PageContainer} from "@ant-design/pro-layout";
import {CheckCard} from "@ant-design/pro-card";
import {TRPCClientError} from "@trpc/client";

const Page = () => {
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(null);
    const columns: ProColumns<DeliveryData>[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true
        },
        {
            title: "收件人",
            dataIndex: "name",
            sorter: true,
            search: false
        },
        {
            title: "手机号码",
            dataIndex: "phone",
            sorter: true,
            search: false
        },
        {
            title: "地址",
            dataIndex: "address",
            search: false
        },
        {
            title: "快递方式",
            dataIndex: "method",
            sorter: true,
            valueType: "select",
            valueEnum: methodMap
        },
        {
            title: "快递单号",
            dataIndex: "expressNumber"
        },
        {
            title: "状态",
            dataIndex: "status",
            sorter: true,
            valueType: "select",
            valueEnum: statusMap
        },
        {
            title: "创建时间",
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
                <Popover key="comment" content={record.comment}>
                    <Button icon={<MessageOutlined/>} disabled={!record.comment} size="small" type="link"/>
                </Popover>,
                <ModalForm
                    key="edit"
                    title="修改运单"
                    initialValues={record}
                    trigger={
                        <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined/>}
                            disabled={record.status !== "pending"}
                        />
                    }
                    modalProps={{
                        destroyOnClose: true
                    }}
                    onFinish={async (values) => {
                        try {
                            values.id = record.id
                            await trpc.delivery.update.mutate(values as DeliverySchema)
                            message.success("修改成功")
                            action?.reload();
                            return true;
                        } catch {
                            message.error("发生错误，请稍后再试")
                            return false;
                        }
                    }}
                >
                    <Form.Item name="method" label="快递方式" rules={[{required: true}]}>
                        <CheckCard.Group>
                            {
                                Object.keys(methodMap).map((method, index) => (
                                    <CheckCard
                                        key={index}
                                        title={methodMap[method as keyof typeof methodMap].text}
                                        value={method}
                                        avatar={
                                            <Avatar src={methodMap[method as keyof typeof methodMap].icon}/>
                                        }
                                    />
                                ))
                            }
                        </CheckCard.Group>
                    </Form.Item>
                    <ProFormText name="name" label="收件人" rules={[{required: true}]}/>
                    <ProFormText
                        name="phone"
                        label="电话号码"
                        rules={[
                            {
                                pattern: /^1\d{10}$/,
                                message: "手机号格式有误"
                            },
                            {
                                required: true
                            }
                        ]}
                    />
                    <ProFormTextArea name="address" label="地址" rules={[{required: true}]}/>
                </ModalForm>,
                <Popconfirm
                    key="cancel"
                    title="提醒"
                    description="您确定取消该订单？"
                    onConfirm={async () => {
                        try {
                            await trpc.delivery.flow.mutate({
                                id: record.id
                            });
                            message.success("取消成功");
                            action?.reload();
                            return true;
                        } catch {
                            message.error("发生错误，请稍后再试");
                            return false;
                        }
                    }}
                    okText="确定"
                    cancelText="取消"
                >
                    <Button
                        size="small"
                        type="link"
                        variant="link"
                        color="danger"
                        icon={<CloseOutlined/>}
                        disabled={record.status !== "waiting" && record.status !== "pushed"}
                    />
                </Popconfirm>,
                <Popconfirm
                    key="delete"
                    title="提醒"
                    description="您确定删除该订单？"
                    onConfirm={async () => {
                        try {
                            await trpc.delivery.delete.mutate({
                                id: record.id
                            });
                            message.success("删除成功");
                            action?.reload();
                            return true;
                        } catch {
                            message.error("发生错误，请稍后再试");
                            return false;
                        }
                    }}
                    okText="确定"
                    cancelText="取消"
                >
                    <Button
                        size="small"
                        type="link"
                        variant="link"
                        color="danger"
                        icon={<DeleteOutlined/>}
                        disabled={record.status !== "pending"}
                    />
                </Popconfirm>
            ]
        }
    ];

    return (
        <PageContainer>
            <ProTable<DeliveryData>
                rowKey="id"
                rowSelection={{}}
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
                                await trpc.delivery.push.mutate({
                                    ids: selectedRowKeys.map((id) => Number(id)),
                                });
                                message.success("推送成功，请注意回调通知");
                                table.current?.reload()
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
                    <Button key="cancle" type="link" onClick={() => table.current?.clearSelected?.()}>取消选择</Button>
                ]}
                toolBarRender={() => [
                    <Link key="add" href="/delivery/create" passHref>
                        <Button type="primary">添加</Button>
                    </Link>
                ]}
                request={async (params, sort) => {
                    const res = await trpc.delivery.get.query({
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

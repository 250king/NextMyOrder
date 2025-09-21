"use client";
import React from "react";
import BaseModalForm from "@repo/component/base/modal";
import trpc from "@/trpc/client";
import {Alert, App, Avatar, Button, Descriptions, Form, Image, Space, Typography} from "antd";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ProFormText, ProFormTextArea} from "@ant-design/pro-form";
import {companyMap, DeliverySchema} from "@repo/schema/delivery";
import {ProColumns, ProTable} from "@ant-design/pro-table";
import {ProFormSwitch} from "@ant-design/pro-components";
import {PageContainer} from "@ant-design/pro-layout";
import {LinkOutlined} from "@ant-design/icons";
import {CheckCard} from "@ant-design/pro-card";
import {TRPCClientError} from "@trpc/client";
import {statusMap} from "@repo/schema/order";
import {cStd} from "@repo/util/data/string";

const Container = (props: {
    data: DeliverySchema,
}) => {
    const params = useSearchParams();
    const message = App.useApp().message;
    const router = useRouter();
    const path = usePathname();
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
        },
        {
            title: "图片",
            width: 100,
            dataIndex: ["item", "image"],
            render: (_, record) => (
                record.item.image ? (
                    <Image
                        src={record.item.image}
                        alt={record.item.name}
                        referrerPolicy="no-referrer"
                        style={{width: 100, height: 100, objectFit: "cover"}}
                    />
                ) : "-"
            ),
        },
        {
            title: "商品",
            dataIndex: "itemId",
            render: (_, record) => (
                <div>
                    <Typography>{record.item.name}</Typography>
                    <Typography style={{fontSize: 12}}>{cStd(record.item.price)}</Typography>
                </div>
            ),
        },
        {
            title: "数量",
            dataIndex: "count",
            valueType: "digit",
        },
        {
            title: "状态",
            dataIndex: "status",
            valueEnum: statusMap,
        },
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record) => [
                <Button key="link" shape="circle" icon={<LinkOutlined/>} size="small" type="link" target="_blank"
                    href={record.item.url}/>,
            ],
        },
    ];

    return (
        <PageContainer
            title={"运单详情"}
            footer={props.data.status === "pending"? [
                <BaseModalForm
                    key="edit"
                    title="修改运单"
                    initialValues={props.data}
                    trigger={<Button type="primary">修改</Button>}
                    onFinish={async (values) => {
                        try {
                            values.id = props.data.id;
                            await trpc.deliverySubmit.mutate(values);
                            router.replace(`${path}?${new URLSearchParams(params).toString()}`);
                            message.success("修改成功");
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
                    <Form.Item name="company" label="快递方式" rules={[{required: true}]}>
                        <CheckCard.Group>
                            {
                                Object.keys(companyMap).map((method, index) => (
                                    <CheckCard
                                        key={index}
                                        title={companyMap[method as keyof typeof companyMap].text}
                                        value={method}
                                        avatar={
                                            <Avatar src={companyMap[method as keyof typeof companyMap].icon}/>
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
                                message: "手机号格式有误",
                            },
                            {
                                required: true,
                            },
                        ]}
                    />
                    <ProFormTextArea name="address" label="地址" rules={[{required: true}]}/>
                    <ProFormSwitch name="save" label="保存收件信息（下次填写运单时自动填充）" initialValue={true}/>
                </BaseModalForm>,
            ]: []}
            content={
                <Space direction="vertical" size="middle">
                    <Alert type="warning" description="如果备注提示一个订单被分开出多个运单，请特别注意运单信息是否正确" showIcon/>
                    {
                        (!props.data.name || !props.data.phone || !props.data.address || !props.data.company) && (
                            <Alert type="warning" description="该运单信息不完整，请及时更新" showIcon/>
                        )
                    }
                    <Descriptions title="基本信息">
                        <Descriptions.Item label="ID">{props.data.id}</Descriptions.Item>
                        <Descriptions.Item label="创建时间">{props.data.createdAt.toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="运单号">{props.data.expressNumber || "未生成"}</Descriptions.Item>
                        <Descriptions.Item label="状态">{statusMap[props.data.status as keyof typeof statusMap]?.text}</Descriptions.Item>
                        <Descriptions.Item label="备注" span={2}>{props.data.comment}</Descriptions.Item>
                    </Descriptions>
                    <Descriptions title="收件信息">
                        <Descriptions.Item label="收件人">{props.data.name}</Descriptions.Item>
                        <Descriptions.Item label="电话号码">{props.data.phone}</Descriptions.Item>
                        <Descriptions.Item label="快递公司">{companyMap[props.data.company as keyof typeof companyMap]?.text}</Descriptions.Item>
                        <Descriptions.Item label="地址" span={3}>{props.data.address}</Descriptions.Item>
                    </Descriptions>
                </Space>
            }
        >
            <ProTable
                rowKey="id"
                columns={columns}
                search={false}
                scroll={{
                    x: 'max-content',
                }}
                request={async (params, sort) => {
                    const res = await trpc.deliveryGetAll.query({
                        sort: {
                            field: Object.keys(sort).length > 0 ? Object.keys(sort)[0] : "id",
                            order: Object.values(sort)[0] === "descend" ? "desc" : "asc",
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

export default Container;

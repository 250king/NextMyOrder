"use client";
import React from "react";
import trpc from "@/trpc/client";
import {Alert, App, Button, Checkbox, Descriptions, Image, Space, Typography} from "antd";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ProColumns, ProTable} from "@ant-design/pro-table";
import {PageContainer} from "@ant-design/pro-layout";
import {LinkOutlined} from "@ant-design/icons";
import {ListSchema} from "@repo/schema/list";
import {statusMap} from "@repo/schema/order";
import {cStd} from "@repo/util/data/string";
import {TRPCClientError} from "@trpc/client";

const Container = (props: {
    data: ListSchema,
}) => {
    const [button, setButton] = React.useState(true);
    const [checkbox, setCheckbox] = React.useState(true);
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
            title: "创建时间",
            dataIndex: "createAt",
            valueType: "dateTime",
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
                <Button
                    key="link"
                    shape="circle"
                    icon={<LinkOutlined/>}
                    href={record.item.url}
                    target="_blank"
                    size="small"
                    type="link"
                />,
            ],
        },
    ];

    return (
        <PageContainer
            title="确认需求单"
            footer={props.data.confirmed ? [] : [
                <Checkbox
                    key="checkbox"
                    value={!button}
                    disabled={checkbox}
                    onChange={() => setButton(!button)}
                >
                    我确认需求单内容无误
                </Checkbox>,
                <Button
                    key="submit"
                    type="primary"
                    disabled={button}
                    onClick={async () => {
                        try {
                            await trpc.confirmOk.mutate({
                                groupId: props.data.group.id,
                            });
                            router.replace(`${path}?${new URLSearchParams(params).toString()}`);
                            message.success("确认成功");
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
                    提交
                </Button>,
            ]}
            content={
                <Space direction="vertical" size="middle">
                    {
                        props.data.confirmed && (
                            <>
                                <Alert type="success" description="您已确认该需求单" showIcon/>
                                <Alert
                                    type="info"
                                    message="完了不小心点错了，里面有些东西是错的"
                                    description="请立刻在订单还没有下单之前联系管理员处理！"
                                    showIcon
                                />
                            </>
                        )
                    }
                    <Descriptions>
                        <Descriptions.Item label="ID">{props.data.id}</Descriptions.Item>
                        <Descriptions.Item label="团购名">{props.data.group.name}</Descriptions.Item>
                        <Descriptions.Item label="Q群">{props.data.user.qq}</Descriptions.Item>
                        <Descriptions.Item label="加入时间">{props.data.createdAt.toLocaleString()}</Descriptions.Item>
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
                onLoad={(data) => {
                    setCheckbox(data.length === 0);
                }}
                request={async (params, sort) => {
                    const res = await trpc.confirmGetAll.query({
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

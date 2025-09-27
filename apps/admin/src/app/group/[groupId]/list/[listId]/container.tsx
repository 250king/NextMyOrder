"use client";
import React from "react";
import ItemSelector from "@/component/form/filter/item";
import OrderForm from "@/component/form/modal/order";
import trpc from "@/trpc/client";
import {CloseOutlined, EditOutlined, LinkOutlined, MessageOutlined} from "@ant-design/icons";
import {App, Button, Popconfirm, Popover, Typography, Descriptions} from "antd";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {PageContainer} from "@ant-design/pro-components";
import {OrderData, statusMap} from "@repo/schema/order";
import {ListSchema} from "@repo/schema/list";
import {TRPCClientError} from "@trpc/client";
import {useRouter} from "next/navigation";
import {cStd} from "@repo/util/data/string";

const Container = (props: {
    data: ListSchema,
    hidden: boolean,
}) => {
    const router = useRouter();
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(null);
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true,
        },
        {
            title: "商品",
            dataIndex: "itemId",
            sorter: true,
            render: (_, record) => (
                <div>
                    <Typography>{record.item.name}</Typography>
                    <Typography style={{fontSize: 12}}>{cStd(record.item.price)}</Typography>
                </div>
            ),
            renderFormItem: () => <ItemSelector/>,
        },
        {
            title: "数量",
            dataIndex: "count",
            sorter: true,
            valueType: "digit",
            search: false,
        },
        {
            title: "状态",
            dataIndex: "status",
            sorter: true,
            valueEnum: statusMap,
            valueType: "select",
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
            render: (_, record, _1, action) => [
                <Button key="link" icon={<LinkOutlined/>} size="small" type="link" target="_blank" href={record.item.url}/>,
                ...(record.comment ? [
                    <Popover key="comment" content={record.comment}>
                        <Button icon={<MessageOutlined/>} size="small" type="link"/>
                    </Popover>,
                ]: []),
                ...(record.status === "pending" ? [
                    <OrderForm
                        key="edit"
                        edit={true}
                        data={record}
                        title="修改订单"
                        target={
                            <Button
                                size="small"
                                type="link"
                                icon={<EditOutlined/>}
                            />
                        }
                        onSubmit={async (values: Record<string, unknown>) => {
                            try {
                                values.id = record.id;
                                await trpc.orderUpdate.mutate(values as OrderData);
                                message.success("修改成功");
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
                ]: []),
                ...(props.data.finished ? [] : [
                    <Popconfirm
                        key={1}
                        title="提醒"
                        description="您确定取消该订单？"
                        onConfirm={async () => {
                            try {
                                await trpc.orderDelete.mutate({
                                    id: record.id,
                                });
                                message.success("删除成功");
                                action?.reload();
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
                        <Button
                            size="small"
                            type="link"
                            variant="link"
                            color="danger"
                            icon={<CloseOutlined/>}
                        />
                    </Popconfirm>,
                ]),
            ],
        },
    ];

    return (
        <PageContainer
            title={props.data.user.name}
            content={
                <Descriptions>
                    <Descriptions.Item label="QQ">{props.data.user.qq}</Descriptions.Item>
                    <Descriptions.Item label="加入时间">{props.data.createdAt.toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="发货信息已完善">{props.data.user.address && props.data.user.phone? "是": "否"}</Descriptions.Item>
                    <Descriptions.Item label="确认状态">{props.data.confirmed? "已确认": "未确认"}</Descriptions.Item>
                    <Descriptions.Item label="完成状态">{props.data.finished? "已完成": "未完成"}</Descriptions.Item>
                </Descriptions>
            }
            extra={props.hidden ? [] : [
                <Popconfirm
                    key="remove"
                    title="提醒"
                    description="您确定移除该用户？"
                    onConfirm={async () => {
                        try {
                            await trpc.listDelete.mutate({
                                groupId: props.data.groupId,
                                userId: props.data.user.id,
                            });
                            message.success("移除成功");
                            router.replace(`/group/${props.data.groupId}`);
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
                    <Button color="danger" variant="solid">移除</Button>
                </Popconfirm>,
            ]}
        >
            <ProTable
                rowKey="id"
                actionRef={table}
                columns={columns}
                search={{filterType: "light"}}
                toolBarRender={() => props.data.finished ? [] : [
                    <OrderForm
                        key="create"
                        edit={false}
                        title="添加订单"
                        target={<Button type="primary">添加</Button>}
                        onSubmit={async (values: Record<string, unknown>) => {
                            try {
                                values.userId = props.data.user.id;
                                await trpc.orderCreateAll.mutate(values as OrderData);
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
                    const res = await trpc.orderGetAll.query({
                        filter: [
                            ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                            ...(params.itemId ? [{
                                field: "itemId",
                                operator: "eq" as const,
                                value: Number(params.itemId),
                            }] : []),
                            ...(params.status ? [{
                                field: "status",
                                operator: "eq" as const,
                                value: params.status,
                            }] : []),
                            {field: "userId", operator: "eq", value: props.data.userId},
                            {field: "item.groupId", operator: "eq", value: props.data.groupId},
                        ],
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

export default Container;

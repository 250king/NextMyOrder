"use client";
import React from "react";
import OrderCheckTable from "@/component/form/table/order";
import GroupSelector from "@/component/form/filter/group";
import BaseModalForm from "@repo/component/base/modal";
import ItemSelector from "@/component/form/filter/item";
import UserSelector from "@/component/form/filter/user";
import BaseTable from "@repo/component/base/table";
import trpc from "@/trpc/client";
import {ShippingData, ShippingSchema, statusMap} from "@repo/schema/shipping";
import {App, Avatar, Button, Form,  Popconfirm, Space, Typography} from "antd";
import {DeleteOutlined, LinkOutlined} from "@ant-design/icons";
import {ActionType, ProColumns} from "@ant-design/pro-table";
import {ProDescriptions} from "@ant-design/pro-components";
import {PageContainer} from "@ant-design/pro-components";
import {TRPCClientError} from "@trpc/client";
import {useRouter} from "next/navigation";

const Container = (props: {
    data: ShippingSchema,
}) => {
    const message = App.useApp().message;
    const router = useRouter();
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
            render: (_, record) => (
                <Space size="middle" align="center">
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${record.user.qq}&s=0`}/>
                    <div>
                        <Typography>{record.user.name}</Typography>
                        <Typography style={{fontSize: 12}}>{record.user.qq}</Typography>
                    </div>
                </Space>
            ),
            renderFormItem: () => <UserSelector/>,
        },
        {
            title: "商品",
            dataIndex: "itemId",
            sorter: true,
            render: (_, record) => (
                <div>
                    <Typography>{record.item.name}</Typography>
                    <Typography style={{fontSize: 12}}>{record.item.group.name}</Typography>
                </div>
            ),
            renderFormItem: () => <ItemSelector/>,
        },
        {
            title: "团购",
            dataIndex: ["item", "groupId"],
            hideInTable: true,
            renderFormItem: () => <GroupSelector/>,
        },
        {
            title: "数量",
            dataIndex: "count",
            valueType: "digit",
            sorter: true,
            search: false,
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
                <Button key="link" shape="circle" icon={<LinkOutlined/>} size="small" type="link" target="_blank" href={record.url}/>,
                <Popconfirm
                    key="remove"
                    title="提醒"
                    description="您确定删除该商品？"
                    onConfirm={async () => {
                        try {
                            await trpc.shippingDeleteOrder.mutate({
                                id: props.data.id,
                                orderId: record.id,
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
                    <Button size="small" type="link" variant="link" color="danger" icon={<DeleteOutlined/>}/>
                </Popconfirm>,
            ],
        },
    ];

    return (
        <PageContainer
            extra={[
                <Button
                    key="check"
                    color="primary"
                    variant="solid"
                    onClick={() => {
                        router.push(`/shipping/${props.data.id}/check`);
                    }}
                >
                    检查汇总
                </Button>,
            ]}
            content={
                <ProDescriptions
                    request={async () => {
                        try {
                            const res = await trpc.shippingGetById.query({id: props.data.id});
                            return {
                                data: res,
                                success: true,
                            };
                        } catch {
                            return {
                                data: {},
                                success: false,
                            };
                        }
                    }}
                    editable={{
                        onSave: async (_key, record) => {
                            try {
                                delete record.items;
                                record.expressNumber = record.expressNumber === ""? null: record.expressNumber;
                                await trpc.shippingUpdate.mutate(record as ShippingData);
                                return true;
                            } catch (e) {
                                if (e instanceof TRPCClientError) {
                                    message.error(e.message);
                                } else {
                                    message.error("发生未知错误");
                                }
                                return false;
                            }
                        },
                    }}
                >
                    <ProDescriptions.Item dataIndex="id" title="ID" editable={false}/>
                    <ProDescriptions.Item dataIndex="expressNumber" title="运单号" formItemProps={{rules: [{required: true}]}} editable={false}/>
                    <ProDescriptions.Item dataIndex="tax" title="税费" valueType="money" formItemProps={{rules: [{required: true}]}}/>
                    <ProDescriptions.Item dataIndex="fee" title="运费" valueType="money" formItemProps={{rules: [{required: true}]}}/>
                    <ProDescriptions.Item dataIndex="createdAt" title="创建时间" valueType="dateTime" editable={false}/>
                    <ProDescriptions.Item dataIndex="status" title="状态" valueEnum={statusMap} formItemProps={{rules: [{required: true}]}}/>
                    <ProDescriptions.Item dataIndex="comment" title="备注" valueType="textarea"/>
                </ProDescriptions>
            }
        >
            <BaseTable
                rowKey="id"
                actionRef={table}
                columns={columns}
                toolBarRender={() => [
                    <BaseModalForm
                        key="add"
                        title="添加订单"
                        width="80%"
                        trigger={<Button type="primary">添加</Button>}
                        onFinish={async (values: Record<string, unknown>) => {
                            try {
                                values.id = props.data.id;
                                await trpc.shippingAddOrders.mutate(values as ShippingData);
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
                    >
                        <Form.Item name="orderIds" rules={[{required: true, message: "请选择订单"}]}>
                            <OrderCheckTable isShow={true}/>
                        </Form.Item>
                    </BaseModalForm>,
                ]}
                request={async (params, sort) => {
                    const res = await trpc.orderGetAll.query({
                        filter: [
                            ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                            ...(params.userId ? [{field: "userId", operator: "eq" as const, value: Number(params.userId)}] : []),
                            ...(params.itemId ? [{field: "itemId", operator: "eq" as const, value: Number(params.itemId)}] : []),
                            ...(params.item?.groupId ? [{field: "item.groupId", operator: "eq" as const, value: Number(params.item.groupId)}] : []),
                            {field: "shippingId", operator: "eq", value: props.data.id},
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

export default Container;

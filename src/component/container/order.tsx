"use client";
import React from "react";
import ItemSelector from "@/component/field/item";
import OrderForm from "@/component/form/order";
import UserSelector from "@/component/field/user";
import trpc from "@/server/client";
import {DeleteOutlined, EditOutlined, LinkOutlined, MessageOutlined, TruckOutlined} from "@ant-design/icons";
import {App, Avatar, Button, Popconfirm, Popover, Space, Typography} from "antd";
import {GroupData, OrderData, OrderSchema, orderStatusMap} from "@/type/group";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {PageContainer} from "@ant-design/pro-layout";
import {currencyFormat} from "@/util/string";
import {useRouter} from "next/navigation";

interface Props {
    data: GroupData
}

const OrderContainer = (props: Props) => {
    const router = useRouter();
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(null);
    const actions = [
        {
            status: "confirmed",
            description: "您确定选中的订单没有错误？",
            buttonText: "确认",
        },
        {
            status: "arrived",
            description: "您确定选中的订单的商品安然无恙？",
            buttonText: "完成验货",
        },
        {
            status: "finished",
            description: "您确定选中的订单以面提方式交付？",
            buttonText: "交付",
        },
        {
            status: "failed",
            description: "您确定作废选中的订单？",
            buttonText: "作废",
        },
    ];
    const columns: ProColumns<OrderData>[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true
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
            renderFormItem: () => <UserSelector/>
        },
        {
            title: "商品",
            dataIndex: "itemId",
            sorter: true,
            render: (_, record) => (
                <div>
                    <Typography>{record.item.name}</Typography>
                    <Typography style={{fontSize: 12}}>{currencyFormat(Number(record.item.price))}</Typography>
                </div>
            ),
            renderFormItem: () => <ItemSelector/>
        },
        {
            title: "数量",
            dataIndex: "count",
            sorter: true,
            valueType: "digit",
            search: false
        },
        {
            title: "状态",
            dataIndex: "status",
            sorter: true,
            valueEnum: orderStatusMap,
            valueType: "select"
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
                <Button key="link" icon={<LinkOutlined/>} size="small" type="link" href={record.item.url}/>,
                <Button
                    key="delivery"
                    size="small"
                    type="link"
                    icon={<TruckOutlined/>}
                    disabled={!record.delivery}
                    onClick={() => {
                        router.push(`/delivery`);
                    }}
                />,
                <Popover key="comment" content={record.comment}>
                    <Button icon={<MessageOutlined/>} disabled={!record.comment} size="small" type="link"/>
                </Popover>,
                <OrderForm
                    key={"edit"}
                    edit={true}
                    data={record}
                    title="修改订单"
                    target={
                        <Button
                            size="small"
                            type="link"
                            icon={<EditOutlined/>}
                            disabled={record.status !== "pending"}
                        />
                    }
                    onSubmit={async (values: Record<string, unknown>) => {
                        try {
                            values.id = record.id;
                            await trpc.order.update.mutate(values as OrderSchema);
                            message.success("修改成功")
                            table.current?.reload();
                            return true;
                        } catch {
                            message.error("发生错误，请稍后再试")
                            return false;
                        }
                    }}
                />,
                <Popconfirm
                    key={1}
                    title="提醒"
                    description="您确定删除该订单？"
                    onConfirm={async () => {
                        try {
                            await trpc.order.delete.mutate({id: record.id});
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
            <ProTable<OrderData>
                rowKey="id"
                actionRef={table}
                columns={columns}
                rowSelection={{}}
                search={{filterType: "light"}}
                tableAlertOptionRender={({selectedRowKeys}) => {
                    const list = actions.map(({status, description, buttonText}) => (
                        <Popconfirm
                            key={status}
                            title="提醒"
                            description={description}
                            onConfirm={async () => {
                                try {
                                    await trpc.order.flow.mutate({
                                        ids: selectedRowKeys.map((id) => Number(id)),
                                        status,
                                    });
                                    table.current?.clearSelected?.();
                                    message.success("修改成功");
                                    table.current?.reload();
                                    return true;
                                } catch {
                                    message.error("发生错误，请稍后再试");
                                    return false;
                                }
                            }}
                        >
                            <Button type="link">{buttonText}</Button>
                        </Popconfirm>
                    ))
                    list.push(
                        <Button key="cancle" type="link" onClick={() => table.current?.clearSelected?.()}>取消选择</Button>
                    )
                    return list;
                }}
                toolBarRender={() => [
                    <OrderForm
                        key="create"
                        edit={false}
                        title="添加订单"
                        target={<Button type="primary" disabled={props.data.status === "finished"}>添加</Button>}
                        onSubmit={async (values: Record<string, unknown>) => {
                            try {
                                values.groupId = props.data.id;
                                await trpc.order.create.mutate(values as OrderSchema);
                                message.success("添加成功");
                                table.current?.reload();
                                return true;
                            } catch {
                                message.error("发生错误，请稍后再试")
                                return false;
                            }
                        }}
                    />
                ]}
                request={async (params, sort) => {
                    const res = await trpc.order.get.query({
                        params: {
                            ...params,
                            item: {
                                groupId: props.data.id
                            }
                        },
                        sort
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

export default OrderContainer;

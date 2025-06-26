"use client";
import React from "react";
import ItemSelector from "@/component/field/item";
import OrderForm from "@/component/form/order";
import trpc from "@/server/client";
import {DeleteOutlined, EditOutlined, LinkOutlined, MessageOutlined, TruckOutlined} from "@ant-design/icons";
import {App, Button, Popconfirm, Popover, Typography, Descriptions} from "antd";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {PageContainer} from "@ant-design/pro-layout";
import {OrderSchema, statusMap} from "@/type/order";
import {currencyFormat} from "@/util/string";
import {TRPCClientError} from "@trpc/client";
import {useRouter} from "next/navigation";
import {JoinData} from "@/type/group";

interface Props {
    data: JoinData
}

type Data = Omit<OrderSchema, "itemId" | "userId"> & {
    userId: number,
    itemIds: number[]
}

const JoinContainer = (props: Props) => {
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
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true
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
            valueEnum: statusMap,
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
        <PageContainer
            title={props.data.user.name}
            content={
                <Descriptions>
                    <Descriptions.Item label="QQ">{props.data.user.qq}</Descriptions.Item>
                    <Descriptions.Item label="手机号">{props.data.user.phone}</Descriptions.Item>
                    <Descriptions.Item label="地址">{props.data.user.address}</Descriptions.Item>
                    <Descriptions.Item label="加入时间">{props.data.createAt.toLocaleString()}</Descriptions.Item>
                </Descriptions>
            }
            extra={[
                <Popconfirm
                    key="remove"
                    title="提醒"
                    description="您确定移除该用户？"
                    onConfirm={async () => {
                        try {
                            await trpc.group.user.delete.mutate({
                                groupId: props.data.groupId,
                                userId: props.data.userId
                            });
                            message.success("移除成功");
                            router.replace("/group");
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
                    <Button color="danger" variant="solid" disabled={props.data.group.status === "finished"}>移除</Button>
                </Popconfirm>
            ]}
        >
            <ProTable
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
                        target={<Button type="primary" disabled={props.data.group.status === "finished"}>添加</Button>}
                        onSubmit={async (values: Record<string, unknown>) => {
                            try {
                                values.groupId = props.data.groupId;
                                values.userId = props.data.userId;
                                await trpc.order.create.mutate(values as Data);
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
                            userId: props.data.userId,
                            item: {
                                groupId: props.data.groupId,
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

export default JoinContainer;

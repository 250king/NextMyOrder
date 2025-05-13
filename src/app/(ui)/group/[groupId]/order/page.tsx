"use client";
import React from "react";
import ItemSelector from "@/component/field/item";
import OrderForm from "@/component/form/order";
import UserSelector from "@/component/field/user";
import $ from "@/util/http/api"
import {App, Avatar, Button, Popconfirm, Popover, Space, Typography} from "antd";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {MessageOutlined, TruckOutlined} from "@ant-design/icons";
import {PageContainer} from "@ant-design/pro-layout";
import {OrderDetail, statusMap} from "@/type/order";
import {queryBuilder} from "@/util/http/query";
import {currencyFormat} from "@/util/string";
import {useParams} from "next/navigation";


const Page = () => {
    const params = useParams();
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(null);
    const columns: ProColumns<OrderDetail>[] = [
        {title: "ID", dataIndex: "id", sorter: true},
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
        {title: "数量", dataIndex: "count", sorter: true, valueType: "digit", search: false},
        {title: "状态", dataIndex: "status", sorter: true, valueEnum: statusMap, valueType: "select"},
        {title: "创建时间", dataIndex: "createAt", valueType: "dateTime", sorter: true, search: false},
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record, _1, action) => [
                <Button
                    key="delivery"
                    shape="circle"
                    size="small"
                    type="link"
                    icon={<TruckOutlined/>}
                    disabled={!record.delivery}
                    onClick={() => {}}
                />,
                <Popover key="comment" content={record.comment}>
                    <Button icon={<MessageOutlined/>} disabled={!record.comment} shape="circle" size="small" type="link"/>
                </Popover>,
                <OrderForm
                    key={"edit"}
                    edit={true}
                    data={record}
                    title="修改订单"
                    target={<a>修改</a>}
                    onSubmit={async (values: Record<string, never>) => {
                        try {
                            await $.patch(`/order/${record.id}`, values)
                            message.success("修改成功")
                            table.current?.reload();
                            return true;
                        }
                        catch {
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
                            await $.delete(`/order/${record.id}`)
                            message.success("删除成功");
                            action?.reload();
                            return true;
                        }
                        catch {
                            message.error("发生错误，请稍后再试");
                            return false;
                        }
                    }}
                    okText="确定"
                    cancelText="取消"
                >
                    <a>删除</a>
                </Popconfirm>
            ]
        }
    ];

    return (
        <PageContainer>
            <ProTable<OrderDetail>
                rowKey="id"
                actionRef={table}
                columns={columns}
                search={{filterType: "light"}}
                toolBarRender={() => [
                    <OrderForm
                        key={"add"}
                        edit={false}
                        title="添加订单"
                        target={<Button type="primary">添加</Button>}
                        onSubmit={async (values) => {
                            try {
                                await $.post(`/group/${params.groupId}/order`, values)
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
                request={async (props, sort) => {
                    const query = queryBuilder(props, sort)
                    const res = await $.get(`/group/${params.groupId}/order`, {params: query});
                    const data = await res.data;
                    return {data: data.items, success: res.status === 200, total: data.total}
                }}
            />
        </PageContainer>
    );
}

export default Page;

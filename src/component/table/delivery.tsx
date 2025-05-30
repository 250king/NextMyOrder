"use client";
import React from "react";
import UserSelector from "@/component/field/user";
import GroupSelector from "@/component/field/group";
import trpc from "@/server/client";
import {useControlModel, WithControlPropsType} from "@ant-design/pro-form";
import {Avatar, Button, Popover, Space, Typography} from "antd";
import {ProColumns, ProTable} from "@ant-design/pro-table";
import {MessageOutlined} from "@ant-design/icons";
import {OrderData} from "@/type/delivery";
import {UserSchema} from "@/type/user";

type Props = WithControlPropsType<{
    callback: React.Dispatch<React.SetStateAction<UserSchema[]>>
}>

const DeliveryTable = (props: Props) => {
    const model = useControlModel(props);
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
            renderFormItem: () => <UserSelector/>,
            render: (_, record) => (
                <Space size="middle" align="center">
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${record.user.qq}&s=0`}/>
                    <div>
                        <Typography>{record.user.name}</Typography>
                        <Typography style={{fontSize: 12}}>{record.user.qq}</Typography>
                    </div>
                </Space>
            )
        },
        {
            title: "商品",
            dataIndex: ["itemId"],
            sorter: true,
            render: (_, record) => (
                <div>
                    <Typography>{record.item.name}</Typography>
                    <Typography style={{fontSize: 12}}>{record.item.group.name}</Typography>
                </div>
            )
        },
        {
            title: "团购",
            dataIndex: ["item", "groupId"],
            hidden: true,
            search: false,
            renderFormItem: () => <GroupSelector/>
        },
        {
            title: "数量",
            dataIndex: "count",
            valueType: "digit",
            sorter: true,
            search: false
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
            render: (_, record) => [
                <Popover key="comment" content={record.comment}>
                    <Button icon={<MessageOutlined/>} disabled={!record.comment} size="small" type="link"/>
                </Popover>
            ]
        }
    ];

    return (
        <ProTable<OrderData>
            rowKey="id"
            columns={columns}
            search={{
                filterType: "light"
            }}
            rowSelection={{
                selectedRowKeys: model.value,
                onChange: (selectedRowKeys, selectedRows) => {
                    if (selectedRows.length !== 0) {
                        props.callback(selectedRows.map(i => i.user))
                    }
                    model.onChange(selectedRowKeys);
                }
            }}
            request={async (params, sort) => {
                const res = await trpc.order.get.query({
                    params: {
                        ...params,
                        status: "arrived",
                        deliveryId: null
                    },
                    sort
                });
                return {
                    data: res.items,
                    success: true,
                    total: res.total
                };
            }}
        />
    );
}

export default DeliveryTable;

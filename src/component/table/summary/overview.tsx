"use client"
import React from "react";
import ItemSelector from "@/component/field/item";
import UserSelector from "@/component/field/user";
import trpc from "@/server/client";
import {ProColumns, ProTable} from "@ant-design/pro-table";
import {Avatar, Space, Typography} from "antd";
import {statusMap} from "@/type/order";
import {GroupData} from "@/type/group";
import {cStd} from "@/util/string";

interface Props {
    data: GroupData
}

const OverviewTable = (props: Props) => {
    const columns: ProColumns[] = [
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
                    <Typography style={{fontSize: 12}}>{cStd(record.item.price)}</Typography>
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
        }
    ];

    return (
        <ProTable
            rowKey="id"
            columns={columns}
            search={{
                filterType: "light"
            }}
            options={{
                search: {
                    allowClear: true
                }
            }}
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
    );
}

export default OverviewTable;

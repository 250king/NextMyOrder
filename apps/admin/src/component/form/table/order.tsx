"use client";
import React from "react";
import GroupFilter from "@/component/form/filter/group";
import ItemFilter from "@/component/form/filter/item";
import UserFilter from "@/component/form/filter/user";
import BaseTable from "@repo/component/base/table";
import trpc from "@/trpc/client";
import {Avatar, Button, Popover, Space, Typography} from "antd";
import {MessageOutlined} from "@ant-design/icons";
import {ProColumns} from "@ant-design/pro-table";
import {dc, dd, sc, sd} from "@/component/match";
import {Filter} from "@repo/util/data/query";
import {useParams, usePathname} from "next/navigation";

const OrderCheckTable = (props: {
    value?: React.Key[],
    onChange?: (value: React.Key[]) => void,
    isShow?: boolean,
    userId?: number | null,
}) => {
    const pathname = usePathname();
    const routeParam = useParams();
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true,
        },
        ...(props.userId ? []: [{
            title: "用户",
            dataIndex: "userId",
            sorter: true,
            render: (_: any, record: any) => (
                <Space size="middle" align="center">
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${record.user.qq}&s=0`}/>
                    <div>
                        <Typography>{record.user.name}</Typography>
                        <Typography style={{fontSize: 12}}>{record.user.qq}</Typography>
                    </div>
                </Space>
            ),
            renderFormItem: () => <UserFilter isShow={props.isShow}/>,
        }]),
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
            renderFormItem: () => <ItemFilter isShow={props.isShow} userId={props.userId}/>,
        },
        {
            title: "团购",
            dataIndex: ["item", "groupId"],
            hideInTable: true,
            renderFormItem: () => <GroupFilter isShow={props.isShow} userId={props.userId}/>,
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
            render: (_, record) => [
                <Popover key="comment" content={record.comment}>
                    <Button icon={<MessageOutlined/>} disabled={!record.comment} size="small" type="link"/>
                </Popover>,
            ],
        },
    ];

    return (
        <BaseTable
            columns={columns}
            rowSelection={{
                type: "checkbox",
                preserveSelectedRowKeys: true,
                selectedRowKeys: props.value? props.value : [],
                onChange: (selectedRowKeys) => {
                    props.onChange?.(selectedRowKeys);
                },
            }}
            params={props.userId ? {userId: props.userId} : {}}
            request={async (params, sort) => {
                const filter : Filter = [
                    ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                    ...(params.userId ? [{field: "userId", operator: "eq" as const, value: Number(params.userId)}] : []),
                    ...(params.itemId ? [{field: "itemId", operator: "eq" as const, value: Number(params.itemId)}] : []),
                    ...(params.item?.groupId ? [{field: "item.groupId", operator: "eq" as const, value: Number(params.item.groupId)}] : []),
                    {field: "item.group.ended", operator: "eq", value: false},
                ];
                if (sc(pathname) || sd(pathname)) {
                    filter.push({field: "shippingId", operator: "eq", value: null});
                }
                if (dc(pathname)) {
                    filter.push({field: "status", operator: "eq", value: "pushed"});
                }
                if (dd(pathname)) {
                    filter.push({field: "deliveries.none.deliveryId", operator: "eq", value: Number(routeParam.deliveryId)});
                }
                const res = await trpc.orderGetAll.query({
                    filter: filter,
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
    );
};

export default OrderCheckTable;

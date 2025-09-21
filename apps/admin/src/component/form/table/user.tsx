"use client";
import React from "react";
import BaseTable from "@repo/component/base/table";
import trpc from "@/trpc/client";
import {ProColumns} from "@ant-design/pro-table";
import {Space, Avatar, Typography} from "antd";
import {dc, ll} from "@/component/match";
import {usePathname} from "next/navigation";
import {Filter} from "@repo/util/data/query";

const UserTable = (props: {
    value?: React.Key[],
    onChange?: (value: React.Key[]) => void,
}) => {
    const pathname = usePathname();
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true,
        },
        {
            title: "QQ",
            dataIndex: "qq",
            sorter: true,
            search: false,
            render: (_, record) => (
                <Space size="middle" align="center">
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${record.qq}&s=0`}/>
                    <div>
                        <Typography>{record.name}</Typography>
                        <Typography style={{fontSize: 12}}>{record.qq}</Typography>
                    </div>
                </Space>
            ),
        },
        {
            title: "邮箱",
            dataIndex: "email",
            sorter: true,
            search: false,
        },
    ];

    return (
        <BaseTable
            columns={columns}
            rowSelection={{
                type: ll(pathname) ? "checkbox" : "radio",
                preserveSelectedRowKeys: true,
                selectedRowKeys: props.value,
                onChange: (selectedRowKeys) => {
                    props.onChange?.(selectedRowKeys);
                },
            }}
            tableAlertRender={ll(pathname) ? undefined : false}
            request={async (params, sort) => {
                const filter : Filter = [
                    ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                ];
                if (ll(pathname)) {
                    filter.push({field: "lists.none.groupId", operator: "eq", value: params.groupId});
                }
                if (dc(pathname)) {
                    filter.push({field: "lists.some.group.ended", operator: "eq", value: false});
                    filter.push({field: "orders.some.status", operator: "eq", value: "pushed"});
                }
                const res = await trpc.userGetAll.query({
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

export default UserTable;

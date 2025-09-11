"use client";
import React from "react";
import BaseTable from "@/component/base/table";
import trpc from "@/server/client";
import Link from "next/link";
import {PageContainer} from "@ant-design/pro-layout";
import {SettingOutlined} from "@ant-design/icons";
import {ProColumns} from "@ant-design/pro-table";
import {statusMap} from "@/type/shipping";
import {Button} from "antd";

const Page = () => {
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true,
        },
        {
            title: "运单号",
            dataIndex: "expressNumber",
            sorter: true,
            search: false,
        },
        {
            title: "税费",
            dataIndex: "tax",
            sorter: true,
            search: false,
        },
        {
            title: "运费",
            dataIndex: "fee",
            sorter: true,
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
            title: '操作',
            valueType: 'option',
            width: 150,
            render: (_, record) => [
                <Link key="manage" href={`/shipping/${record.id}`} passHref>
                    <Button type="link" icon={<SettingOutlined/>}/>
                </Link>,
            ],
        },
    ];

    return (
        <PageContainer>
            <BaseTable
                columns={columns}
                toolBarRender={() => [
                    <Link key="add" href="/shipping/create" passHref>
                        <Button type="primary">添加</Button>
                    </Link>,
                ]}
                request={async (params, sort) => {
                    const res = await trpc.shippingGetAll.query({
                        filter: params.id? [{field: "id", operator: "eq", value: Number(params.id)}] : [],
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

export default Page;

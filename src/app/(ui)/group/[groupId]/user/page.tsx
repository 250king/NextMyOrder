"use client";
import React from "react";
import JoinForm from "@/component/form/join";
import $ from "@/util/http/api"
import {App, Avatar, Popconfirm, Space, Typography} from "antd";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {PageContainer} from "@ant-design/pro-layout";
import {SortOrder} from "antd/es/table/interface";
import {queryBuilder} from "@/util/http/query";
import {useParams} from "next/navigation";
import {JoinDetail} from "@/type/join";

const Page = () => {
    const params = useParams();
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(undefined);
    const columns: ProColumns<JoinDetail>[] = [
        {title: "ID", dataIndex: "userId", sorter: true},
        {
            title: "QQ",
            dataIndex: ["user", "qq"],
            sorter: true,
            search: false,
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
        {title: "邮箱", dataIndex: ["user", "email"], sorter: true, search: false},
        {title: "加入时间", dataIndex: "createAt", valueType: "dateTime", sorter: true, search: false},
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record, _1, action) => [
                <Popconfirm
                    key={0}
                    title="提醒"
                    description="您确定移除该用户？"
                    onConfirm={async () => {
                        try {
                            await $.delete(`/group/${record.groupId}/user/${record.userId}`)
                            message.success("移除成功");
                            action?.reload();
                            return true;
                        }
                        catch {
                            message.error("发生错误，请稍后再试");
                            return false;
                        }
                    }}
                >
                    <a>移除</a>
                </Popconfirm>
            ]
        }
    ];

    return (
        <PageContainer>
            <ProTable<JoinDetail>
                rowKey="userId"
                actionRef={table}
                columns={columns}
                search={{filterType: "light"}}
                options={{search: {allowClear: true}}}
                toolBarRender={() => [<JoinForm key={"create"} table={table.current}/>]}
                request={async (props, sort) => {
                    const field: Record<string, SortOrder> = {"userId": "ascend"}
                    const query = queryBuilder(props, Object.keys(sort).length === 0? field: sort);
                    const res = await $.get(`/group/${params.groupId}/user`, {params: query});
                    const data = await res.data;
                    return {data: data.items, success: res.status === 200, total: data.total}
                }}
            />
        </PageContainer>
    );
}

export default Page;

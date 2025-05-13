"use client";
import React from "react";
import ItemForm from "@/component/form/item";
import $ from "@/util/http/api"
import {CheckOutlined, CloseOutlined, LinkOutlined} from "@ant-design/icons";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {PageContainer} from "@ant-design/pro-layout";
import {queryBuilder} from "@/util/http/query";
import {App, Button, Popconfirm} from "antd";
import {useParams} from "next/navigation";
import {statusMap} from "@/type/item";
import {Item} from "@prisma/client";

const Page = () => {
    const params = useParams();
    const message = App.useApp().message;
    const table = React.useRef<ActionType>(undefined);
    const columns: ProColumns<Item>[] = [
        {title: "ID", dataIndex: "id", sorter: true},
        {title: "名称", dataIndex: "name", sorter: true, search: false},
        {title: "单价", dataIndex: "price", sorter: true, valueType: "money", search: false, fieldProps: {precision: 0}},
        {title: "重量", dataIndex: "weight", sorter: true, valueType: "digit", search: false},
        {
            title: "合规性",
            dataIndex: "allowed",
            sorter: true,
            valueType: "select",
            valueEnum: statusMap,
            render: (_, record) => (
                record.allowed? <CheckOutlined/>: <CloseOutlined/>
            )
        },
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record, _1, action) => [
                <Button key="link" shape="circle" icon={<LinkOutlined/>} size="small" type="link" href={record.url}/>,
                <ItemForm
                    key="edit"
                    title="修改商品"
                    target={<a>修改</a>}
                    data={record}
                    onSubmit={async (values: Record<string, never>) => {
                        try {
                            await $.patch(`/item/${record.id}`, values)
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
                    key="remove"
                    title="提醒"
                    description="您确定删除该商品？"
                    onConfirm={async () => {
                        try {
                            await $.delete(`/item/${record.id}`)
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
            <ProTable<Item>
                rowKey="id"
                actionRef={table}
                columns={columns}
                search={{filterType: "light"}}
                options={{search: {allowClear: true}}}
                toolBarRender={() => [
                    <ItemForm
                        key={"add"}
                        title="添加商品"
                        target={<Button type="primary">添加</Button>}
                        onSubmit={async (values) => {
                            try {
                                await $.post(`/group/${params.groupId}/item`, values);
                                message.success("添加成功");
                                table.current?.reload();
                                return true;
                            }
                            catch {
                                message.error("该商品已存在")
                                return false;
                            }
                        }}
                    />
                ]}
                request={async (props, sort) => {
                    const query = queryBuilder(props, sort);
                    const res = await $.get(`/group/${params.groupId}/item`, {params: query});
                    const data = res.data;
                    return {data: data.items, success: res.status === 200, total: data.total}
                }}
            />
        </PageContainer>
    );
}

export default Page;

"use client";
import React from "react";
import trpc from "@/server/client";
import {CheckOutlined, LinkOutlined} from "@ant-design/icons";
import {ModalForm, ProFormDigit} from "@ant-design/pro-form";
import {ProColumns, ProTable} from "@ant-design/pro-table";
import {App, Button, Typography} from "antd";
import {cStd} from "@/util/string";

interface Props {
    data: Record<string, unknown>[] | undefined
}

const ItemTable = (props: Props) => {
    const message = App.useApp().message;
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: (a, b) => a.id - b.id
        },
        {
            title: "商品",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (_, record) => (
                <div>
                    <Typography>{record.name}</Typography>
                    <Typography style={{fontSize: 12}}>
                        {Intl.NumberFormat("ja-JP", {style: "currency", currency: "JPY"}).format(Number(record.price))}
                    </Typography>
                </div>
            )
        },
        {
            title: "数量",
            dataIndex: "count",
            valueType: "digit",
            sorter: (a, b) => a.count - b.count
        },
        {
            title: "汇总",
            valueType: "money",
            render: (_, record) => cStd(record.total),
            sorter: (a, b) => a.total - b.total
        },
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record) => [
                <Button key="link" icon={<LinkOutlined/>} size="small" type="link" href={record.url}/>,
                <ModalForm
                    key="pushed"
                    title="存货信息"
                    trigger={<Button icon={<CheckOutlined/>} size="small" type="link"/>}
                    initialValues={{
                        count: record.count
                    }}
                    modalProps={{
                        destroyOnClose: true
                    }}
                    onFinish={async (values) => {
                        try {
                            await trpc.order.push.mutate({
                                itemId: record.id,
                                count: values.count
                            })
                            message.success("修改成功")
                            return true;
                        } catch {
                            message.error("发生错误，请稍后再试")
                            return false;
                        }
                    }}
                >
                    <ProFormDigit name="count" label="数量" min={1} max={record.count} rules={[{required: true}]}/>
                </ModalForm>
            ]
        }
    ];

    return (
        <ProTable rowKey="id" options={{reload: false}} dataSource={props.data} columns={columns} search={false}/>
    );
}

export default ItemTable;

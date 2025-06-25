"use client";
import React from "react";
import {ProColumns, ProTable} from "@ant-design/pro-table";
import {Avatar, Button, Space, Typography} from "antd";
import {User} from "@/type/summary";
import {ModalForm, ProFormMoney} from "@ant-design/pro-form";
import {cStd, rStd} from "@/util/string";

interface Props {
    data?: User[]
}

const UserTable = (props: Props) => {
    const [tax, setTax] = React.useState<number>(0);
    const columns: ProColumns[] = [
        {title: "ID", dataIndex: "id", sorter: (a, b) => a.id - b.id},
        {
            title: "QQ",
            dataIndex: "qq",
            sorter: (a, b) => Number(a.qq) - Number(b.qq),
            render: (_, record) => (
                <Space size="middle" align="center">
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${record.qq}&s=0`}/>
                    <div>
                        <Typography>{record.name}</Typography>
                        <Typography style={{fontSize: 12}}>{record.qq}</Typography>
                    </div>
                </Space>
            )
        },
        {
            title: "汇总",
            dataIndex: "total",
            valueType: "money",
            sorter: (a, b) => a.total - b.total,
            render: (_, record) => cStd(record.total)
        },
        {
            title: "占比",
            dataIndex: "ratio",
            valueType: "percent",
            sorter: false,
            render: (_, record) => rStd(record.ratio)
        },
        {
            title: "税费",
            dataIndex: "tax",
            valueType: "money",
            sorter: false,
            render: (_, record) => new Intl.NumberFormat("zh-CN", {
                style: "currency",
                currency: "CNY"
            }).format(tax * record.ratio)
        }
    ];

    return (
        <ProTable
            rowKey="id"
            dataSource={props.data}
            columns={columns}
            search={false}
            options={{
                reload: false
            }}
            toolBarRender={() => [
                <ModalForm
                    key="add"
                    title="设置税费"
                    trigger={<Button type="primary">税费计算</Button>}
                    initialValues={{
                        tax: tax
                    }}
                    modalProps={{
                        destroyOnClose: true
                    }}
                    onFinish={async (values) => {
                        setTax(values.tax);
                        return true;
                    }}
                >
                    <ProFormMoney name="tax" label="总额" rules={[{required: true}]} min={0} fieldProps={{precision: 2}}/>
                </ModalForm>
            ]}
        />
    );
}

export default UserTable;

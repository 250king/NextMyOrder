"use client";
import React from "react";
import {ModalForm, ProFormMoney} from "@ant-design/pro-form";
import {ProColumns, ProTable} from "@ant-design/pro-table";
import {Avatar, Button, Space, Typography} from "antd";
import {useLiveQuery} from "dexie-react-hooks";
import {mStd, rStd} from "@/util/string";
import {db} from "@/util/data/indexedDB";
import {GroupData} from "@/type/group";
import {Weight} from "@/type/summary";

interface Props {
    data: Weight[]
    group: GroupData
}

const WeightTable = (props: Props) => {
    const result = useLiveQuery(
        async () => await db.localData.where("id").equals(props.group.id).first(),
        [props.group.id],
        {fee: 0} // 默认值
    )
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: (a, b) => a.id - b.id
        },
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
            title: "总重",
            dataIndex: "total",
            valueType: "digit",
            sorter: (a, b) => a.total - b.total,
            render: (_, record) => mStd(record.total)
        },
        {
            title: "占比",
            dataIndex: "ratio",
            valueType: "percent",
            sorter: false,
            render: (_, record) => rStd(record.ratio)
        },
        {
            title: "运费",
            dataIndex: "fee",
            valueType: "money",
            sorter: false,
            render: (_, record) => new Intl.NumberFormat("zh-CN", {
                style: "currency",
                currency: "CNY"
            }).format((result?.fee || 0) * record.ratio)
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
                    title="设置运费"
                    trigger={<Button type="primary">运费计算</Button>}
                    initialValues={{
                        fee: result?.fee
                    }}
                    modalProps={{
                        destroyOnHidden: true
                    }}
                    onFinish={async (values) => {
                        await db.localData.put({
                            ...result,
                            id: props.group.id,
                            fee: values.fee
                        });
                        return true;
                    }}
                >
                    <ProFormMoney name="fee" label="总额" rules={[{required: true}]} min={0} fieldProps={{precision: 2}}/>
                </ModalForm>
            ]}
        />
    );
}

export default WeightTable;

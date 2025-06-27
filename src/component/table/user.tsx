"use client";
import React from "react";
import trpc from "@/server/client";
import {useControlModel, WithControlPropsType} from "@ant-design/pro-form";
import {ProColumns, ProTable} from "@ant-design/pro-table";
import {Space, Avatar, Typography} from "antd";
import {FormInstance} from "antd/lib";

type Props = WithControlPropsType<{
    form: FormInstance | null
}>

const UserTable = (props: Props) => {
    const model = useControlModel(props);
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true
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
            )
        },
        {
            title: "邮箱",
            dataIndex: "email",
            sorter: true,
            search: false
        }
    ];

    return (
        <ProTable
            rowKey="id"
            columns={columns}
            tableAlertRender={false}
            search={{
                filterType: "light"
            }}
            options={{
                search: {
                    allowClear: true
                }
            }}
            rowSelection={{
                type: "radio",
                selectedRowKeys: model.value? [model.value] : [],
                onChange: (selectedRowKeys, selectedRows) => {
                    model.onChange(selectedRowKeys[0]);
                    console.log(props.form?.getFieldsValue());
                    props.form?.setFieldsValue({
                        name: selectedRows[0].name,
                        phone: selectedRows[0].phone,
                        address: selectedRows[0].address
                    });
                }
            }}
            request={async (params, sort) => {
                const res = await trpc.user.get.query({
                    sort,
                    params: {
                        orders: {
                            some: {
                                status: "arrived"
                            }
                        },
                        ...params
                    }
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

export default UserTable;

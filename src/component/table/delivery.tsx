"use client";
import React from "react";
import UserSelector from "@/component/field/user";
import GroupSelector from "@/component/field/group";
import $ from "@/util/http/api";
import {useControlModel, WithControlPropsType} from "@ant-design/pro-form";
import {Avatar, Button, Popover, Space, Typography} from "antd";
import {ProColumns, ProTable} from "@ant-design/pro-table";
import {queryBuilder} from "@/util/http/query";
import {EyeOutlined} from "@ant-design/icons";
import {Delivery} from "@/type/delivery";
import {User} from "@prisma/client";

type Props = WithControlPropsType<{callback: React.Dispatch<React.SetStateAction<User[]>>}>

const DeliveryTable = (props: Props) => {
    const model = useControlModel(props);
    const columns: ProColumns<Delivery>[] = [
        {title: "ID", dataIndex: "id", sorter: true},
        {
            title: "用户",
            dataIndex: "userId",
            sorter: true,
            renderFormItem: () => <UserSelector/>,
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
        {
            title: "商品",
            dataIndex: ["item", "name"],
            sorter: true,
            search: false,
            render: (_, record) => (
                <div>
                    <Typography>{record.item.name}</Typography>
                    <Typography style={{fontSize: 12}}>{record.item.group.name}</Typography>
                </div>
            )
        },
        {
            title: "团购",
            dataIndex: ["item", "groupId"],
            hidden: true,
            renderFormItem: () => <GroupSelector/>
        },
        {title: "数量", dataIndex: "count", sorter: true, valueType: "digit", search: false},
        {title: "创建时间", dataIndex: "createAt", valueType: "dateTime", sorter: true, search: false},
        {
            title: "备注",
            dataIndex: "comment",
            search: false,
            render: (_, record) => {
                if (!record.comment) return "-";
                return (
                    <Popover content={record.comment}>
                        <Button shape="circle" icon={<EyeOutlined/>} size="small" type="link"/>
                    </Popover>
                );
            }
        }
    ];

    return (
        <ProTable<Delivery>
            rowKey="id"
            columns={columns}
            search={{filterType: "light"}}
            rowSelection={{
                selectedRowKeys: model.value,
                onChange: (selectedRowKeys, selectedRows) => {
                    if (selectedRows.length !== 0) {
                        props.callback(selectedRows.map(i => i.user))
                    }
                    model.onChange(selectedRowKeys);
                }
            }}
            request={async (props, sort) => {
                const query = queryBuilder(props, sort)
                const res = await $.get(`/order`, {params: query});
                const data = await res.data;
                return {data: data.items, success: res.status === 200, total: data.total}
            }}
        />
    );
}

export default DeliveryTable;

"use client";
import React from "react";
import GroupSelector from "@/component/form/field/group";
import trpc from "@/server/client";
import {ProFormInstance, useControlModel, WithControlPropsType} from "@ant-design/pro-form";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-table";
import {MessageOutlined} from "@ant-design/icons";
import {Button, Popover, Typography} from "antd";
import {cStd} from "@/util/string";

type Props = WithControlPropsType<{
    form: React.RefObject<ProFormInstance | null>,
}>

const OrderTable = (props: Props) => {
    const table = React.useRef<ActionType>(null);
    const model = useControlModel(props);
    const userId = props.form.current?.getFieldValue("userId");
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true,
        },
        {
            title: "团购",
            dataIndex: ["item", "groupId"],
            search: false,
            renderFormItem: () => <GroupSelector/>,
            render: (_, record) => (
                <div>
                    <Typography>{record.item.group.name}</Typography>
                    <Typography style={{fontSize: 12}}>{record.item.group.qq}</Typography>
                </div>
            ),
        },
        {
            title: "商品",
            dataIndex: "itemId",
            sorter: true,
            render: (_, record) => (
                <div>
                    <Typography>{record.item.name}</Typography>
                    <Typography style={{fontSize: 12}}>{cStd(record.item.price)}</Typography>
                </div>
            ),
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
            dataIndex: "createAt",
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
    React.useEffect(() => {
        const current = table.current;
        if (userId) {
            current?.reload();
        }
        return () => {
            current?.clearSelected?.();
        };
    }, [userId]);

    return (
        <ProTable
            rowKey="id"
            columns={columns}
            actionRef={table}
            search={{
                filterType: "light",
            }}
            rowSelection={{
                selectedRowKeys: model.value,
                onChange: (selectedRowKeys) => {
                    model.onChange(selectedRowKeys);
                },
            }}
            request={async (params, sort) => {
                if (!props.form.current?.getFieldValue("userId")) {
                    return {
                        data: [],
                        success: true,
                        total: 0,
                    };
                }
                const res = await trpc.order.get.query({
                    params: {
                        ...params,
                        userId: userId,
                        deliveryId: null,
                        status: "arrived",
                    },
                    sort,
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

export default OrderTable;

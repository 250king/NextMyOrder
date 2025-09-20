import React from "react";
import {EditableProTable, EditableProTableProps, ProColumns} from "@ant-design/pro-components";
import {ItemSchema} from "@repo/schema/item";
import {cStd} from "@repo/util/data/string";
import {Typography} from "antd";

const PushTable = (props: EditableProTableProps<ItemSchema & {
    confirmed: number,
}, any>) => {
    const [editableKeys, setEditableRowKeys] = React.useState<React.Key[]>(() =>
        props.value!.map((item) => item.id),
    );
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            readonly: true,
        },
        {
            title: "商品",
            dataIndex: "name",
            sorter: true,
            search: false,
            editable: false,
            render: (_, record) => (
                <div>
                    <Typography>{record.name}</Typography>
                    <Typography style={{fontSize: 12}}>
                        {cStd(Number(record.price))}
                    </Typography>
                </div>
            ),
        },
        {
            title: "上报数量",
            dataIndex: "pending",
            valueType: "digit",
            fieldProps: (_form, {rowIndex}) => {
                const confirmed = props.value![rowIndex].confirmed;
                return {
                    min: 0,
                    max: confirmed,
                    precision: 0,
                };
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        type: "number",
                    },
                ],
            },
        },
    ];

    return (
        <EditableProTable
            {...props}
            rowKey="id"
            columns={columns}
            toolBarRender={false}
            recordCreatorProps={false}
            editable={{
                editableKeys,
                onChange: setEditableRowKeys,
                type: 'multiple',
            }}
        />
    );
};

export default PushTable;

import React from "react";
import {EditableProTable, EditableProTableProps, ProColumns} from "@ant-design/pro-components";
import {ItemSchema} from "@repo/schema/item";

const CheckTable = (props: EditableProTableProps<ItemSchema & {
    check: number,
}, never>) => {
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
        },
        {
            title: "上报数量",
            dataIndex: "check",
            valueType: "digit",
            fieldProps: (_form, {rowIndex}) => {
                const check = props.value![rowIndex].check;
                return {
                    min: 0,
                    max: check,
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

export default CheckTable;

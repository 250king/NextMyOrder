import React from "react";
import trpc from "@/trpc/client";
import {ModalForm, ProFormDigit, ProFormSelect, ProFormTextArea} from "@ant-design/pro-form";
import {OrderSchema} from "@repo/schema/order";
import {cStd} from "@repo/util/data/string";
import {useParams} from "next/navigation";
import {Typography} from "antd";

export const OrderForm = (props: {
    title: string,
    edit: boolean,
    data?: OrderSchema,
    target: React.ReactElement,
    onSubmit: (values: Record<string, never>) => Promise<boolean>,
}) => {
    const params = useParams();

    return (
        <ModalForm
            title={props.title}
            trigger={props.target}
            onFinish={props.onSubmit}
            modalProps={{
                destroyOnHidden: true,
            }}
            initialValues={props.data ?? {
                status: "pending",
                count: 1,
            }}
        >
            {
                props.edit? null: (
                    <ProFormSelect
                        showSearch
                        mode="multiple"
                        name="itemIds"
                        label="商品"
                        debounceTime={500}
                        rules={[{required: true}]}
                        fieldProps={{
                            filterOption: false,
                            optionRender: option => (
                                <div>
                                    <Typography>{option.data.name}</Typography>
                                    <Typography style={{fontSize: 12}}>
                                        {cStd(option.data.price)}
                                    </Typography>
                                </div>
                            ),
                        }}
                        request={async (props) => {
                            const res = await trpc.itemGetAll.query({
                                filter: [
                                    {field: "groupId", operator: "eq", value: Number(params.groupId)},
                                ],
                                search: props.keyWords,
                            });
                            return res.items.map((item) => ({
                                ...item,
                                label: item.name,
                                value: item.id,
                            }));
                        }}
                    />
                )
            }
            <ProFormDigit name="count" label="数量" rules={[{required: true}]} min={1} fieldProps={{precision: 0}}/>
            <ProFormTextArea name="comment" label="备注"/>
        </ModalForm>
    );
};

export default OrderForm;

import React from "react";
import trpc from "@/server/client";
import {ModalForm, ProFormDigit, ProFormSelect, ProFormTextArea} from "@ant-design/pro-form";
import {currencyFormat} from "@/util/string";
import {useParams} from "next/navigation";
import {OrderSchema} from "@/type/order";
import {Typography} from "antd";

interface Props {
    title: string,
    edit: boolean,
    data?: OrderSchema,
    target: React.ReactElement,
    onSubmit: (values: Record<string, never>) => Promise<boolean>
}

export const OrderForm = (props: Props) => {
    const params = useParams();

    return (
        <ModalForm
            title={props.title}
            trigger={props.target}
            initialValues={props.data ?? {status: "pending", count: 1}}
            modalProps={{destroyOnClose: true}}
            onFinish={props.onSubmit}
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
                                        {currencyFormat(option.data.price)}
                                    </Typography>
                                </div>
                            )
                        }}
                        request={async (props) => {
                            const res = await trpc.item.get.query({
                                params: {
                                    keyword: props.keyWords ?? "",
                                    groupId: Number(params.groupId),
                                    allowed: "true"
                                },
                            });
                            return res.items.map((item) => ({
                                ...item,
                                label: item.name,
                                value: item.id
                            }));
                        }}
                    />
                )
            }
            <ProFormDigit name="count" label="数量" rules={[{required: true}]} min={1} fieldProps={{precision: 0}}/>
            <ProFormTextArea name="comment" label="备注"/>
        </ModalForm>
    );
}

export default OrderForm;

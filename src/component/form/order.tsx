import React from "react";
import trpc from "@/server/client";
import {ModalForm, ProFormDigit, ProFormSelect, ProFormTextArea} from "@ant-design/pro-form";
import {Avatar, Space, Typography} from "antd";
import {currencyFormat} from "@/util/string";
import {useParams} from "next/navigation";
import {OrderSchema} from "@/type/order";

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
                    <>
                        <ProFormSelect
                            showSearch
                            name="userId"
                            label="用户"
                            debounceTime={500}
                            rules={[{required: true}]}
                            fieldProps={{
                                filterOption: false,
                                optionRender: option => (
                                    <Space size="middle" align="center">
                                        <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${option.data.user.qq}&s=0`}/>
                                        <div>
                                            <Typography>{option.label}</Typography>
                                            <Typography style={{fontSize: 12}}>{option.data.user.qq}</Typography>
                                        </div>
                                    </Space>
                                )
                            }}
                            request={async (props) => {
                                const res = await trpc.group.user.get.query({
                                    params: {
                                        keyword: props.keyWords ?? ""
                                    },
                                    sort: params.groupId? {
                                        userId: "ascend"
                                    }: {},
                                    groupId: Number(params.groupId)
                                });
                                return res.items.map((join) => ({
                                    ...join,
                                    label: join.user.name,
                                    value: join.userId,
                                }));
                            }}
                        />
                        <ProFormSelect
                            showSearch
                            name="itemId"
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
                                        allowed: true
                                    },
                                });
                                return res.items.map((item) => ({
                                    ...item,
                                    label: item.name,
                                    value: item.id
                                }));
                            }}
                        />
                    </>
                )
            }
            <ProFormDigit name="count" label="数量" rules={[{required: true}]} min={1} fieldProps={{precision: 0}}/>
            <ProFormTextArea name="comment" label="备注"/>
        </ModalForm>
    );
}

export default OrderForm;

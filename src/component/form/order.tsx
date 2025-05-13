import React from "react";
import $ from "@/util/http/api";
import {ModalForm, ProFormDigit, ProFormSelect, ProFormTextArea} from "@ant-design/pro-form";
import {Avatar, Space, Typography} from "antd";
import {OrderDetail, statusMap} from "@/type/order";
import {currencyFormat} from "@/util/string";
import {JoinDetail} from "@/type/join";
import {useParams} from "next/navigation";
import {Item} from "@prisma/client";

interface Props {
    title: string,
    data?: OrderDetail,
    target: React.ReactElement,
    edit: boolean,
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
                                const res = await $.get(`/group/${params.groupId}/user`, {
                                    params: {
                                        keyword: props.keyWords ?? ""
                                    }
                                });
                                return res.data.items.map((join: JoinDetail) => ({
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
                                        <Typography style={{color: option.data.allowed? "inherit": "darkgray"}}>
                                            {option.data.name}
                                        </Typography>
                                        <Typography
                                            style={{
                                                fontSize: 12,
                                                color: option.data.allowed? "inherit": "darkgray"
                                            }}
                                        >
                                            {currencyFormat(option.data.price)}
                                        </Typography>
                                    </div>
                                )
                            }}
                            request={async (props) => {
                                const res = await $.get(`/group/${params.groupId}/item`, {
                                    params: {
                                        keyword: props.keyWords ?? ""
                                    }
                                });
                                return res.data.items.map((item: Item) => ({
                                    ...item,
                                    label: item.name,
                                    value: item.id,
                                    disabled: !item.allowed
                                }));
                            }}
                        />
                    </>
                )
            }
            <ProFormDigit name="count" label="数量" rules={[{required: true}]} min={1} fieldProps={{precision: 0}}/>
            <ProFormSelect name="status" label="状态" valueEnum={statusMap}/>
            <ProFormTextArea name="comment" label="备注"/>
        </ModalForm>
    );
}

export default OrderForm;

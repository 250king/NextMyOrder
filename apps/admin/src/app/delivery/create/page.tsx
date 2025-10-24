"use client";
import React from "react";
import OrderCheckTable from "@/component/form/table/order";
import UserTable from "@/component/form/table/user";
import trpc from "@/trpc/client";
import {ProFormInstance, ProFormText, ProFormTextArea} from "@ant-design/pro-form";
import {DeliveryData, companyMap} from "@repo/schema/delivery";
import {PageContainer} from "@ant-design/pro-layout";
import {StepsForm} from "@ant-design/pro-components";
import {CheckCard} from "@ant-design/pro-card";
import {TRPCClientError} from "@trpc/client";
import {useRouter} from "next/navigation";
import {App, Avatar, Form} from "antd";

const Page = () => {
    const router = useRouter();
    const message = App.useApp().message;
    const form = React.useRef<ProFormInstance | null>(null);
    const [user, setUser] = React.useState<number | null>(null);
    const [step, setStep] = React.useState(0);

    return (
        <PageContainer>
            <StepsForm
                containerStyle={step === 2 ? {} : {width: "100%"}}
                onCurrentChange={(current) => setStep(current)}
                onFinish={async (values) => {
                    try {
                        values.userId = values.userId[0];
                        await trpc.deliveryCreate.mutate(values as DeliveryData);
                        message.success("创建成功");
                        router.back();
                    } catch (e) {
                        if (e instanceof TRPCClientError) {
                            message.error(e.message);
                        } else {
                            message.error("发生未知错误");
                        }
                        return false;
                    }
                    return false;
                }}
            >
                <StepsForm.StepForm
                    title="选择用户"
                    name="user"
                    onValuesChange={async (_, values) => {
                        setUser(values.userId[0]);
                        form.current?.setFieldsValue(await trpc.userGetById.query({id: values.userId[0]}));
                    }}
                >
                    <Form.Item name="userId" rules={[{required: true, message: "请选择用户"}]}>
                        <UserTable/>
                    </Form.Item>
                </StepsForm.StepForm>
                <StepsForm.StepForm title="选择订单" name="choice">
                    <Form.Item name="orderIds" rules={[{required: true, message: "请选择订单"}]}>
                        <OrderCheckTable userId={user}/>
                    </Form.Item>
                </StepsForm.StepForm>
                <StepsForm.StepForm title="生成运单" name="info" formRef={form}>
                    <Form.Item name="company" label="快递方式">
                        <CheckCard.Group>
                            {
                                Object.keys(companyMap).map((method, index) => (
                                    <CheckCard
                                        key={index}
                                        title={companyMap[method as keyof typeof companyMap].text}
                                        value={method}
                                        avatar={
                                            <Avatar src={companyMap[method as keyof typeof companyMap].icon}/>
                                        }
                                    />
                                ))
                            }
                        </CheckCard.Group>
                    </Form.Item>
                    <ProFormText name="name" label="收件人" rules={[{required: true}, {pattern: /^[\u4e00-\u9fa5A-Za-z0-9 ]+$/}]}/>
                    <ProFormText
                        name="phone"
                        label="电话号码"
                        rules={[{pattern: /^1\d{10}$/, message: "手机号格式有误"}]}
                    />
                    <ProFormTextArea name="address" label="地址"/>
                    <ProFormTextArea name="comment" label="备注"/>
                </StepsForm.StepForm>
            </StepsForm>
        </PageContainer>
    );
};

export default Page;

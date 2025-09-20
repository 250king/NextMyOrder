"use client";
import React from "react";
import OrderCheckTable from "@/component/form/table/order";
import trpc from "@/trpc/client";
import {ProFormMoney, ProFormText, ProFormTextArea} from "@ant-design/pro-form";
import {PageContainer} from "@ant-design/pro-layout";
import {StepsForm} from "@ant-design/pro-components";
import {ShippingData} from "@repo/schema/shipping";
import {TRPCClientError} from "@trpc/client";
import {useRouter} from "next/navigation";
import {App, Form} from "antd";

const Page = () => {
    const message = App.useApp().message;
    const router = useRouter();
    const [step, setStep] = React.useState(0);

    return (
        <PageContainer>
            <StepsForm
                containerStyle={step === 1 ? {width: "100%"} : {}}
                onCurrentChange={(current) => setStep(current)}
                onFinish={async (values) => {
                    try {
                        values.expressNumber = values.expressNumber === ""? null: values.expressNumber;
                        await trpc.shippingCreate.mutate(values as ShippingData & {
                            itemIds: number[],
                        });
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
                <StepsForm.StepForm title="基本信息" name="basic">
                    <ProFormText name="expressNumber" label="运单号"/>
                    <ProFormMoney name="tax" label="税费"/>
                    <ProFormMoney name="fee" label="运费"/>
                    <ProFormTextArea name="comment" label="备注"/>
                </StepsForm.StepForm>
                <StepsForm.StepForm title="绑定订单" name="select">
                    <Form.Item name="orderIds" rules={[{required: true, message: "请选择商品"}]}>
                        <OrderCheckTable isShow={true}/>
                    </Form.Item>
                </StepsForm.StepForm>
            </StepsForm>
        </PageContainer>
    );
};

export default Page;

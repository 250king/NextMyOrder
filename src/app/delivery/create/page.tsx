"use client";
import React from "react";
import OrderTable from "@/component/table/order";
import PrintField from "@/component/form/field/print";
import UserTable from "@/component/form/table/user";
import printLabel from "@/util/print/label";
import trpc from "@/server/client";
import {ProFormInstance, ProFormText, ProFormTextArea} from "@ant-design/pro-form";
import {DeliverySchema, methodMap} from "@/type/delivery";
import {PageContainer} from "@ant-design/pro-layout";
import {StepsForm} from "@ant-design/pro-components";
import {CheckCard} from "@ant-design/pro-card";
import {labelSdk} from "@/util/print/sdk";
import {useRouter} from "next/navigation";
import {App, Avatar, Form} from "antd";

const Page = () => {
    const message = App.useApp().message;
    const router = useRouter();
    const info = React.useRef<ProFormInstance>(null);
    const user = React.useRef<ProFormInstance>(null);
    const [step, setStep] = React.useState(0);
    const [data, setData] = React.useState<Record<string, unknown>>();
    const [image, setImage] = React.useState("");
    React.useEffect(() => {
        if (step !== 3) {
            return;
        }
        const init = async () => {
            await labelSdk.connect();
            const painters = JSON.parse((await labelSdk.getAllPrinters()).info as string);
            await labelSdk.selectPrinter(Object.keys(painters)[0], Number(Object.values(painters)[0]));
            await labelSdk.initSdk();
            await labelSdk.setPrinterAutoShutDownTime(4);
        };
        init().then(async () => {
            const result = JSON.parse((await printLabel(data!))?.info as string);
            setImage(result.ImageData);
        }).catch((err) => {
            message.error(err.message);
        });
        return () => {
            labelSdk.disconnect();
            setImage("");
        };
    }, [data, step, message]);

    return (
        <PageContainer>
            <StepsForm
                containerStyle={step === 0 || step === 1 ? {width: "100%"} : {}}
                onCurrentChange={(current) => setStep(current)}
                onFinish={async (values) => {
                    try {
                        delete values.userId;
                        delete values.label;
                        await trpc.delivery.create.mutate(values as DeliverySchema);
                        message.success("创建成功");
                        router.back();
                    } catch {
                        message.error("创建失败");
                    }
                    return false;
                }}
            >
                <StepsForm.StepForm title="选择用户" name="select" formRef={user}>
                    <Form.Item
                        name="userId"
                        rules={[
                            {
                                message: "请选择用户",
                                validator: async (_, value: number) => {
                                    if (!value) {
                                        return Promise.reject();
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <UserTable form={info}/>
                    </Form.Item>
                </StepsForm.StepForm>
                <StepsForm.StepForm title="选择订单" name="choice">
                    <Form.Item
                        name="orderIds"
                        rules={[
                            {
                                message: "请选择订单",
                                validator: async (_, value: number[]) => {
                                    if (value.length === 0) {
                                        return Promise.reject();
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <OrderTable form={user}/>
                    </Form.Item>
                </StepsForm.StepForm>
                <StepsForm.StepForm
                    title="生成运单"
                    name="info"
                    formRef={info}
                    onFinish={async (values) => {
                        try {
                            values.label = (await trpc.setting.get.query()).label;
                            setData(values);
                            return true;
                        } catch {
                            message.error("发生错误，请稍后再试");
                            return false;
                        }
                    }}
                >
                    <Form.Item name="method" label="快递方式" rules={[{required: true}]}>
                        <CheckCard.Group>
                            {
                                Object.keys(methodMap).map((method, index) => (
                                    <CheckCard
                                        key={index}
                                        title={methodMap[method as keyof typeof methodMap].text}
                                        value={method}
                                        avatar={
                                            <Avatar src={methodMap[method as keyof typeof methodMap].icon}/>
                                        }
                                    />
                                ))
                            }
                        </CheckCard.Group>
                    </Form.Item>
                    <ProFormText name="name" label="收件人" rules={[{required: true}]}/>
                    <ProFormText
                        name="phone"
                        label="电话号码"
                        rules={[
                            {
                                pattern: /^1\d{10}$/,
                                message: "手机号格式有误",
                            },
                            {
                                required: true,
                            },
                        ]}
                    />
                    <ProFormTextArea name="address" label="地址" rules={[{required: true}]}/>
                </StepsForm.StepForm>
                <StepsForm.StepForm title="打印" name="print">
                    <Form.Item
                        name="print"
                        rules={[
                            {
                                message: "请打印订单",
                                validator: async (_, value: boolean) => {
                                    if (!value) {
                                        return Promise.reject();
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <PrintField data={data} image={image}/>
                    </Form.Item>
                </StepsForm.StepForm>
            </StepsForm>
        </PageContainer>
    );
};

export default Page;

"use client";
import React from "react";
import DeliveryTable from "@/component/table/delivery";
import PrintField from "@/component/field/print";
import printLabel from "@/util/print/label";
import $ from "@/util/http/api";
import {ProFormText, ProFormTextArea} from "@ant-design/pro-form";
import {PageContainer} from "@ant-design/pro-layout";
import {StepsForm} from "@ant-design/pro-components";
import {CheckCard} from "@ant-design/pro-card";
import {labelSdk} from "@/util/print/sdk";
import {methodMap} from "@/type/delivery";
import {useRouter} from "next/navigation";
import {App, Avatar, Form} from "antd";
import {User} from "@prisma/client";

const Page = () => {
    const message = App.useApp().message;
    const router = useRouter();
    const [step, setStep] = React.useState(0);
    const [user, setUser] = React.useState<User[]>([]);
    const [data, setData] = React.useState<Record<string, unknown>>();
    const [connect, setConnect] = React.useState("");
    React.useEffect(
        () => {
            const init = async () => {
                await labelSdk.connect()
                const painters = JSON.parse((await labelSdk.getAllPrinters()).info)
                await labelSdk.selectPrinter(Object.keys(painters)[0], Number(Object.values(painters)[0]))
                await labelSdk.initSdk()
                await labelSdk.setPrinterAutoShutDownTime(4)
            }
            if (step !== 2) return;
            init().then(async () => {
                const result = JSON.parse((await printLabel(data!)).info)
                setConnect(result.ImageData)
            }).catch((err) => {
                message.error(err.message);
            });
            return () => {
                labelSdk.disconnect()
                setConnect("");
            };
        },
        [data, step, message]
    )

    return (
        <PageContainer>
            <StepsForm
                containerStyle={step === 0? {width: "100%"}: {}}
                onCurrentChange={(current) => setStep(current)}
                onFormFinish={(name, info) => {
                    if (name === "select") {
                        info.forms.info.setFieldsValue(user[0]);
                    }
                }}
                onFinish={async (values) => {
                    try {
                        delete values.print
                        await $.post("/delivery", values)
                        message.success("创建成功")
                        router.back()
                        return true
                    }
                    catch {
                        message.error("创建失败")
                        return false
                    }
                }}
            >
                <StepsForm.StepForm title="选择订单" name="select">
                    <Form.Item
                        name="orders"
                        rules={[
                            {
                                message: "请选择订单",
                                validator: async (_, value: number[]) => {
                                    if (value.length === 0) return Promise.reject();
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <DeliveryTable callback={setUser}/>
                    </Form.Item>
                </StepsForm.StepForm>
                <StepsForm.StepForm
                    title="生成运单"
                    name="info"
                    onFinish={async (values) => {
                        try {
                            const res = await $.get(`/util/delivery`, {
                                params: {
                                    address: values.address,
                                }
                            })
                            const result = res.data;
                            values.city = result.city;
                            values.province = result.province;
                            values.town = result.town;
                            setData(values);
                            return true;
                        }
                        catch {
                            message.error("发生错误，请稍后再试")
                            return false
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
                                            <Avatar icon={methodMap[method as keyof typeof methodMap].icon}/>
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
                            {pattern: /^1\d{10}$/, message: "手机号格式有误"},
                            {required: true}
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
                                    if (!value) return Promise.reject();
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <PrintField data={data} image={connect}/>
                    </Form.Item>
                </StepsForm.StepForm>
            </StepsForm>
        </PageContainer>
    );
}

export default Page;

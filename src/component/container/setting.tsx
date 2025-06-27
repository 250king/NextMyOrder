"use client";
import React from "react";
import trpc from "@/server/client";
import {SettingSchema} from "@/type/setting";
import {PageContainer} from "@ant-design/pro-layout";
import {ProForm, ProFormText, ProFormTextArea} from "@ant-design/pro-form";
import {App} from "antd";

interface Props {
    data: SettingSchema
}

const SettingContainer = (props: Props) => {
    const message = App.useApp().message;

    return (
        <PageContainer childrenContentStyle={{display: 'flex', justifyContent: 'center'}}>
            <ProForm
                initialValues={props.data}
                style={{
                    maxWidth: 600,
                    width: '100%'
                }}
                submitter={{
                    resetButtonProps: false
                }}
                onFinish={async (values) => {
                    try {
                        await trpc.setting.update.mutate(values as SettingSchema);
                        message.success("设置已保存");
                        return true;
                    } catch {
                        message.error("设置保存失败");
                        return false;
                    }
                }}
            >
                <ProFormText name="name" label="发件人姓名" rules={[{required: true}]}/>
                <ProFormText
                    name="phone"
                    label="发件人手机号"
                    rules={[
                        {
                            required: true
                        },
                        {
                            pattern: /^1\d{10}$/,
                            message: "手机号格式有误"
                        }
                    ]}
                />
                <ProFormTextArea name="address" label="发货地址" rules={[{required: true}]}/>
                <ProFormText name="cargo" label="默认商品类型" rules={[{required: true}]}/>
                <ProFormText name="label" label="标签机抬头" rules={[{required: true}]}/>
            </ProForm>
        </PageContainer>
    );
}

export default SettingContainer;

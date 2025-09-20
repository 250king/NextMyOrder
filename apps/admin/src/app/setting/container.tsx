"use client";
import trpc from "@/trpc/client";
import {PageContainer, ProForm} from "@ant-design/pro-components";
import {ProFormText, ProFormTextArea} from "@ant-design/pro-form";
import {SettingSchema} from "@repo/schema/setting";
import {TRPCClientError} from "@trpc/client";
import {App, Divider} from "antd";
import {useRouter} from "next/navigation";

const Container = (props: {
    data: SettingSchema,
}) => {
    const message = App.useApp().message;
    const router = useRouter();

    return (
        <PageContainer childrenContentStyle={{display: 'flex', justifyContent: 'center'}}>
            <ProForm
                initialValues={props.data}
                layout="horizontal"
                labelCol={{
                    span: 4,
                }}
                wrapperCol={{
                    span: 14,
                }}
                submitter={{
                    resetButtonProps: false,
                }}
                style={{
                    maxWidth: 600,
                    width: '100%',
                }}
                onFinish={async (values) => {
                    try {
                        await trpc.settingUpdate.mutate(values as SettingSchema);
                        message.success("更新成功");
                        router.refresh();
                        return true;
                    } catch (e) {
                        if (e instanceof TRPCClientError) {
                            message.error(e.message);
                        } else {
                            message.error("发生未知错误");
                        }
                        return false;
                    }
                }}
            >
                <ProFormText name="title" label="标题"/>
                <ProFormText name="logo" label="Logo"/>
                <Divider/>
                <ProFormText name="name" label="发件人"/>
                <ProFormText name="phone" label="联系电话"/>
                <ProFormTextArea name="address" label="发件地址"/>
                <ProFormText name="cargo" label="默认物品名称"/>
                <Divider/>
                <ProFormText name="label" label="抬头"/>
            </ProForm>
        </PageContainer>
    );
};

export default Container;

import React from "react";
import trpc from "@/server/client";
import {ModalForm, ProForm, ProFormInstance, ProFormText, ProFormTextArea} from "@ant-design/pro-form";
import {App, Button, Space} from "antd";
import {UserSchema} from "@/type/user";

interface Props {
    title: string,
    data?: UserSchema,
    target: React.ReactElement,
    onSubmit: (values: Record<string, never>) => Promise<boolean>
}

const UserForm = (props: Props) => {
    const message = App.useApp().message;
    const form = React.useRef<ProFormInstance>(undefined);
    const [loading, setLoading] = React.useState(false);

    return (
        <ModalForm
            title={props.title}
            formRef={form}
            trigger={props.target}
            onFinish={props.onSubmit}
            initialValues={props.data}
            modalProps={{
                destroyOnHidden: true
            }}
        >
            <ProForm.Item label="QQ" name="qq" rules={[{required: true}, {pattern: /^\d+$/, message: "QQ号格式有误"}]}>
                <Space.Compact style={{width: "100%"}}>
                    <ProFormText name="qq" noStyle/>
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={async () => {
                            const qq = form.current?.getFieldsValue().qq;
                            if (!qq) return;
                            setLoading(true);
                            try {
                                const res = await trpc.user.getName.query({qq});
                                form.current?.setFieldsValue({name: res.name});
                            }
                            catch {
                                message.error("无法自动获得信息，请手动输入")
                            }
                            finally {
                                setLoading(false);
                            }
                        }}
                    >
                        解析
                    </Button>
                </Space.Compact>
            </ProForm.Item>
            <ProFormText name="name" label="昵称" rules={[{required: true}]}/>
            <ProFormText name="email" label="邮箱" rules={[{type: "email", message: "邮箱格式有误"}]}/>
            <ProFormText name="phone" label="手机号" rules={[{pattern: /^1\d{10}$/, message: "手机号格式有误"}]}/>
            <ProFormTextArea name="address" label="地址"/>
        </ModalForm>
    );
}

export default UserForm;

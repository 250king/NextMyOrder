import React from "react";
import trpc from "@/trpc/client";
import {ModalForm, ProForm, ProFormInstance, ProFormText} from "@ant-design/pro-form";
import {GroupSchema} from "@repo/schema/group";
import {App, Button, Space} from "antd";

const GroupForm = (props: {
    title: string,
    data?: GroupSchema,
    target: React.ReactElement,
    onSubmit: (values: Record<string, never>) => Promise<boolean>,
}) => {
    const message = App.useApp().message;
    const form = React.useRef<ProFormInstance>(null);
    const [loading, setLoading] = React.useState(false);

    return (
        <ModalForm
            title={props.title}
            formRef={form}
            trigger={props.target}
            onFinish={props.onSubmit}
            modalProps={{
                destroyOnHidden: true,
            }}
            initialValues={props.data ?? {
                status: "activated",
            }}
        >
            <ProForm.Item label="Q群" name="qq" rules={[{required: true}, {pattern: /^\d+$/, message: "Q群格式有误"}]}>
                <Space.Compact style={{width: "100%"}}>
                    <ProFormText name="qq" noStyle/>
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={async () => {
                            const qq = form.current?.getFieldsValue().qq;
                            if (!qq) {
                                return;
                            }
                            setLoading(true);
                            try {
                                const res = await trpc.groupGetNick.query({qq});
                                form.current?.setFieldsValue({
                                    name: res.name,
                                });
                            } catch {
                                message.error("无法自动获得信息，请手动输入");
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        解析
                    </Button>
                </Space.Compact>
            </ProForm.Item>
            <ProFormText name="name" label="名称" rules={[{required: true}]}/>
        </ModalForm>
    );
};

export default GroupForm;

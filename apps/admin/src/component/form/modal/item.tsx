import React from "react";
import trpc from "@/trpc/client";
import {
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormInstance,
    ProFormMoney,
    ProFormText,
} from "@ant-design/pro-form";
import {App, Button, Space} from "antd";
import {ItemSchema} from "@repo/schema/item";

const ItemForm = (props: {
    title: string,
    data?: ItemSchema,
    target: React.ReactElement,
    onSubmit: (values: Record<string, never>) => Promise<boolean>,
}) => {
    const message = App.useApp().message;
    const form = React.useRef<ProFormInstance>(null);
    const [loading, setLoading] = React.useState(false);

    return (
        <ModalForm
            formRef={form}
            title={props.title}
            trigger={props.target}
            onFinish={props.onSubmit}
            modalProps={{
                destroyOnHidden: true,
            }}
            initialValues={props.data ?? {
                allowed: true,
            }}
        >
            <ProFormText name="name" label="名称" rules={[{required: true}]}/>
            <ProForm.Item name="url" label="URL" rules={[{required: true}, {type: "url", message: "URL格式有误"}]}>
                <Space.Compact style={{width: "100%"}}>
                    <ProFormText name="url" noStyle/>
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={async () => {
                            if (!form.current?.getFieldsValue().url) {
                                return;
                            }
                            setLoading(true);
                            try {
                                const res = await trpc.itemGetInfo.query({
                                    url: form.current.getFieldsValue().url,
                                });
                                form.current?.setFieldsValue(res);
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
            <ProFormText name="image" label="图片URL" rules={[{type: "url", message: "URL格式有误"}]}/>
            <ProFormMoney
                name="price"
                label="单价"
                customSymbol={"JP￥"}
                min={0}
                fieldProps={{
                    precision: 0,
                }}
                rules={[
                    {
                        required: true,
                    },
                ]}
            />
            <ProFormDigit name="weight" label="重量" min={0} fieldProps={{precision: 0, suffix: "g"}}/>
        </ModalForm>
    );
};

export default ItemForm;

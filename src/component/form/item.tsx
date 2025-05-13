import React from "react";
import $ from "@/util/http/api";
import {
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormInstance,
    ProFormMoney,
    ProFormSwitch,
    ProFormText
} from "@ant-design/pro-form";
import {App, Button, Space} from "antd";
import {Item} from "@prisma/client";

interface Props {
    title: string,
    data?: Item,
    target: React.ReactElement,
    onSubmit: (values: Record<string, never>) => Promise<boolean>
}

const ItemForm = (props: Props) => {
    const message = App.useApp().message;
    const form = React.useRef<ProFormInstance>(undefined);
    const [loading, setLoading] = React.useState(false);

    return (
        <ModalForm
            formRef={form}
            title={props.title}
            trigger={props.target}
            onFinish={props.onSubmit}
            initialValues={props.data ?? {allowed: false}}
            modalProps={{destroyOnClose: true}}
        >
            <ProFormText name="name" label="名称" rules={[{required: true}]}/>
            <ProForm.Item name="url" label="URL" rules={[{required: true}, {type: "url", message: "URL格式有误"}]}>
                <Space.Compact style={{width: "100%"}}>
                    <ProFormText name="url" noStyle/>
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={async () => {
                            if (!form.current?.getFieldsValue().url) return;
                            setLoading(true);
                            try {
                                const res = await $.get(`/util/item`, {
                                    params: {
                                        url: form.current.getFieldsValue().url,
                                    }
                                });
                                const data = res.data;
                                form.current?.setFieldsValue({name: data.name, price: data.price, url: data.url});
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
            <ProFormMoney name="price" label="单价" rules={[{required: true}]} locale="ja_JP" min={0}  fieldProps={{precision: 0}}/>
            <ProFormDigit name="weight" label="重量" min={0} fieldProps={{precision: 0}}/>
            <ProFormSwitch name="allowed" label="合规性"/>
        </ModalForm>
    );
}

export default ItemForm;

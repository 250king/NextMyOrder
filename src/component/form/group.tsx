import React from "react";
import {ModalForm, ProFormText} from "@ant-design/pro-form";
import {GroupSchema} from "@/type/group";

interface Props {
    title: string,
    data?: GroupSchema,
    target: React.ReactElement,
    onSubmit: (values: Record<string, never>) => Promise<boolean>
}

const GroupForm = (props: Props) => {
    return (
        <ModalForm
            title={props.title}
            trigger={props.target}
            onFinish={props.onSubmit}
            modalProps={{destroyOnClose: true}}
            initialValues={props.data ?? {status: "activated"}}
        >
            <ProFormText name="qq" label="Q群" rules={[{required: true}, {pattern: /^\d+$/, message: "Q群号格式不正确"}]}/>
            <ProFormText name="name" label="名称" rules={[{required: true}]}/>
        </ModalForm>
    );
}

export default GroupForm;

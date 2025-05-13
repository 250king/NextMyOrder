import React from "react";
import {Group} from "@prisma/client";
import {ModalForm, ProFormSelect, ProFormText} from "@ant-design/pro-form";
import {statusMap} from "@/type/group";

interface Props {
    title: string,
    data?: Group,
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
            <ProFormSelect name="status" label="状态" valueEnum={statusMap}/>
        </ModalForm>
    );
}

export default GroupForm;

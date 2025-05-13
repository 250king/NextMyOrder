import React from "react";
import $ from "@/util/http/api";
import {ModalForm, ProFormSelect} from "@ant-design/pro-form";
import {App, Avatar, Button, Space, Typography} from "antd";
import {useParams} from "next/navigation";
import {User} from "@prisma/client";
import {ActionType} from "@ant-design/pro-table";

interface Props {
    table?: ActionType
}

const JoinForm =(props: Props) => {
    const message = App.useApp().message;
    const params = useParams();

    return (
        <ModalForm
            title="添加用户"
            modalProps={{destroyOnClose: true}}
            trigger={<Button type="primary">添加</Button>}
            onFinish={async (values: Record<string, never>) => {
                try {
                    await $.post(`/group/${params.groupId}/user`, values)
                    message.success("添加成功")
                    props.table?.reload();
                    return true
                }
                catch {
                    message.error("该用户已存在")
                    return false;
                }
            }}
        >
            <ProFormSelect
                showSearch
                name="userId"
                label="用户"
                debounceTime={500}
                rules={[{required: true}]}
                fieldProps={{
                    filterOption: false,
                    optionRender: option => (
                        <Space size="middle" align="center">
                            <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${option.data.qq}&s=0`} />
                            <div>
                                <Typography>{option.data.name}</Typography>
                                <Typography style={{fontSize: 12}}>{option.data.qq}</Typography>
                            </div>
                        </Space>
                    )
                }}
                request={async (props) => {
                    const res = await $.get("/user", {
                        params: {
                            keyword: props.keyWords
                        }
                    });
                    return res.data.items.map((user: User) => ({
                        ...user,
                        label: user.name,
                        value: user.id
                    }));
                }}
            />
        </ModalForm>
    );
}

export default JoinForm;

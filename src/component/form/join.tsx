import React from "react";
import trpc from "@/server/client";
import {ModalForm, ProFormSelect} from "@ant-design/pro-form";
import {App, Avatar, Button, Space, Typography} from "antd";
import {ActionType} from "@ant-design/pro-table";
import {GroupData} from "@/type/group";

interface Props {
    table?: ActionType
    data: GroupData
}

const JoinForm =(props: Props) => {
    const message = App.useApp().message;

    return (
        <ModalForm
            title="添加用户"
            trigger={<Button type="primary" disabled={props.data.status !== "activated"}>添加</Button>}
            modalProps={{
                destroyOnHidden: true
            }}
            onFinish={async (values: Record<string, never>) => {
                try {
                    await trpc.group.user.add.mutate({
                        groupId: props.data.id,
                        userId: values.userId
                    });
                    message.success("添加成功");
                    props.table?.reload();
                    return true
                }
                catch {
                    message.error("该用户已存在");
                    return false;
                }
            }}
        >
            <ProFormSelect
                showSearch
                name="userId"
                label="用户"
                debounceTime={500}
                rules={[
                    {
                        required: true
                    }
                ]}
                fieldProps={{
                    filterOption: false,
                    optionRender: option => (
                        <Space size="middle" align="center">
                            <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${option.data.qq}&s=0`}/>
                            <div>
                                <Typography>{option.data.name}</Typography>
                                <Typography style={{fontSize: 12}}>{option.data.qq}</Typography>
                            </div>
                        </Space>
                    )
                }}
                request={async (props) => {
                    const res = await trpc.user.get.query({
                        params: {
                            keyword: props.keyWords
                        }
                    });
                    return res.items.map((user) => ({
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

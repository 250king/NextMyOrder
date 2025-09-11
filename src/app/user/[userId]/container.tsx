"use client";
import {UserSchema} from "@/type/user";
import {App, Button, Descriptions, Popconfirm} from "antd";
import {usePathname, useRouter} from "next/navigation";
import {PageContainer} from "@ant-design/pro-layout";
import UserForm from "@/component/form/modal/user";
import trpc from "@/server/client";
import {TRPCClientError} from "@trpc/client";
import React from "react";

const Container = (props: {
    data: UserSchema,
}) => {
    const message = App.useApp().message;
    const router = useRouter();
    const path = usePathname();
    return (
        <PageContainer
            title={props.data.name}
            content={
                <Descriptions>
                    <Descriptions.Item label="QQ">{props.data.qq}</Descriptions.Item>
                    <Descriptions.Item label="手机号">{props.data.phone}</Descriptions.Item>
                    <Descriptions.Item label="邮箱">{props.data.email}</Descriptions.Item>
                    <Descriptions.Item label="注册时间">{props.data.createdAt.toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="地址">{props.data.address}</Descriptions.Item>
                </Descriptions>
            }
            extra={[
                <UserForm
                    key="edit"
                    data={props.data}
                    title="修改用户"
                    target={<Button>修改</Button>}
                    onSubmit={async (values: Record<string, unknown>) => {
                        try {
                            values.id = props.data.id;
                            await trpc.userUpdate.mutate(values as UserSchema);
                            message.success("修改成功");
                            router.replace(path);
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
                />,
                <Popconfirm
                    key="remove"
                    title="提醒"
                    description="您确定移除该用户？"
                    onConfirm={async () => {
                        try {
                            await trpc.userDelete.mutate({
                                id: props.data.id,
                            });
                            message.success("移除成功");
                            router.replace("/user");
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
                    <Button color="danger" variant="solid">移除</Button>
                </Popconfirm>,
            ]}
        >
        </PageContainer>
    );
};

export default Container;

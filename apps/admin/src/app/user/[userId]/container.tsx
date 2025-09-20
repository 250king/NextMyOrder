"use client";
import React from "react";
import trpc from "@/trpc/client";
import {PageContainer, ProDescriptions} from "@ant-design/pro-components";
import {UserData, UserSchema} from "@repo/schema/user";
import {App, Button, Popconfirm} from "antd";
import {TRPCClientError} from "@trpc/client";
import {useRouter} from "next/navigation";

const Container = (props: {
    data: UserSchema,
}) => {
    const message = App.useApp().message;
    const router = useRouter();
    return (
        <PageContainer
            content={
                <ProDescriptions
                    request={async () => {
                        try {
                            const res = await trpc.userGetById.query({id: props.data.id});
                            return {
                                data: res,
                                success: true,
                            };
                        } catch {
                            return {
                                data: {},
                                success: false,
                            };
                        }
                    }}
                    editable={{
                        onSave: async (_key, record) => {
                            try {
                                delete record.createdAt;
                                await trpc.userUpdate.mutate(record as UserData);
                                return true;
                            } catch (e) {
                                if (e instanceof TRPCClientError) {
                                    message.error(e.message);
                                } else {
                                    message.error("发生未知错误");
                                }
                                return false;
                            }
                        },
                    }}
                >
                    <ProDescriptions.Item dataIndex="id" title="ID" editable={false}/>
                    <ProDescriptions.Item dataIndex="name" title="昵称" formItemProps={{rules: [{required: true}]}}/>
                    <ProDescriptions.Item dataIndex="qq" title="QQ" formItemProps={{rules: [{required: true}, {pattern: /^\d+$/}]}}/>
                    <ProDescriptions.Item dataIndex="phone" title="手机号" formItemProps={{rules: [{pattern: /^1\d{10}$/}]}}/>
                    <ProDescriptions.Item dataIndex="email" title="邮箱" formItemProps={{rules: [{type: "email"}]}}/>
                    <ProDescriptions.Item dataIndex="createdAt" title="创建时间" valueType="dateTime" editable={false}/>
                    <ProDescriptions.Item dataIndex="address" title="地址" valueType="textarea" span={3}/>
                </ProDescriptions>
            }
            extra={[
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

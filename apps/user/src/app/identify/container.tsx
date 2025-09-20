"use client";
import Cookies from 'js-cookie';
import {PageContainer} from "@ant-design/pro-layout";
import {Avatar, Button, Result, Tooltip} from "antd";
import {UserSchema} from "@repo/schema/user";
import {useRouter} from "next/navigation";

const Container = (props: {
    data: UserSchema,
    callback: string,
    token: string,
}) => {
    const router = useRouter();

    return (
        <PageContainer
            title="请确认您的身份"
            childrenContentStyle={{
                minHeight: 'calc(100vh - 146px)', display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
            }}
        >
            <Result
                icon={<Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${props.data.qq}&s=0`} size={128}/>}
                title={props.data.name}
                subTitle={props.data.qq}
                extra={[
                    <Button
                        type="primary"
                        key="ok"
                        onClick={() => {
                            Cookies.set("user_id", props.data.id.toString(), {expires: 180});
                            router.replace(`${props.callback}?token=${props.token}`);
                        }}
                    >
                        这是我
                    </Button>,
                    <Tooltip key="cancel" trigger="click" title="如果这不是您，请联系管理员重新索取链接">
                        <Button type="primary" danger>这不是我</Button>
                    </Tooltip>,
                ]}
            />
        </PageContainer>
    );
};

export default Container;

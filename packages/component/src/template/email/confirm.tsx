import {createJWT} from "@repo/util/security/jwt";
import {ListSchema} from "@repo/schema/list";
import {
    Body,
    Button,
    Container,
    Head,
    Html,
    Img,
    Section,
    Text,
} from '@react-email/components';

const main = {
    backgroundColor: '#f6f9fc',
    padding: '10px 0',
};

const container = {
    backgroundColor: '#ffffff',
    border: '1px solid #f0f0f0',
    padding: '45px',
};

const text = {
    fontSize: '16px',
    fontFamily:
        "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
    fontWeight: '300',
    color: '#404040',
    lineHeight: '26px',
};

const button = {
    backgroundColor: '#007ee6',
    borderRadius: '4px',
    color: '#fff',
    fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
    fontSize: '15px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '210px',
    padding: '14px 7px',
};

const ConfirmEmail = async (props: {
    data: ListSchema,
}) => {
    const jwt = await createJWT({
        groupId: props.data.groupId,
    }, props.data.userId.toString(), "confirm", "30d");
    const url = `${process.env.PUBLIC_APP_URL}/confirm?token=${jwt}`;

    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Img src="https://s1.250king.top/image/2025/08/yqwfnbsi.png" width={40} height={40} alt=""/>
                    <Section>
                        <Text style={text}>亲爱的{props.data.user.name},</Text>
                        <Text style={text}>
                            您好！您于{props.data.createdAt.toLocaleString("zh-cn")}加入了{props.data.group.name}团购。我们已经收到了您的需求并制作了该需求列表。请点击下面的链接确认内容是否无误
                        </Text>
                        <Button style={button} href={url}>
                            前往确认
                        </Button>
                        <Text style={text}>
                            请您在收到此邮件后尽快确认需求列表内容，以便我们能及时处理您的需求。如果链接失效，请联系管理员重新索取邮件。
                        </Text>
                        <Text style={text}>祝您购物愉快！</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default ConfirmEmail;

import {createJWT} from "@repo/util/security/jwt";
import {DeliverySchema} from "@repo/schema/delivery";
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

const DeliveryEmail = async (props: {
    data: DeliverySchema,
}) => {
    const jwt = await createJWT({
        deliveryId: props.data.id,
    }, props.data.user.id.toString(), "delivery", "30d");
    const url = `${process.env.PUBLIC_APP_URL}/delivery?token=${jwt}`;

    return (
        <Html>
            <Head/>
            <Body style={main}>
                <Container style={container}>
                    <Img src="https://s1.250king.top/image/2025/08/yqwfnbsi.png" width={40} height={40} alt=""/>
                    <Section>
                        <Text style={text}>亲爱的{props.data.user.name},</Text>
                        <Text style={text}>
                            您好！目前您的商品已抵达中转站并完成相关验收手续。下一步就要送到您手中了！请点击下方按钮完善您的收货信息：
                        </Text>
                        <Button style={button} href={url}>
                            前往填写
                        </Button>
                        <Text style={text}>
                            请您在收到此邮件后尽快确认完善您的收货信息，以便我们能及时处理您的需求。如果链接失效，请联系管理员重新索取邮件。
                        </Text>
                        <Text style={text}>祝您购物愉快！</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default DeliveryEmail;

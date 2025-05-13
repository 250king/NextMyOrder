import React from "react";
import {Avatar, Card, Col} from "antd";
import Link from "next/link";
import Meta from "antd/es/card/Meta";

interface Props {
    title: string;
    icon: React.ElementType;
    to: string;
}

const ActionCard = (props: Props) => {
    return (
        <Col xs={24} sm={12} md={8} lg={6}>
            <Link href={props.to}>
                <Card>
                    <Meta
                        avatar={<Avatar icon={<props.icon/>}/>}
                        title={props.title}
                    />
                </Card>
            </Link>
        </Col>
    );
}

export default ActionCard;

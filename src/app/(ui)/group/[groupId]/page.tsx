import React from "react";
import ActionCard from "@/component/action";
import GroupStatus from "@/component/status/group";
import GroupContainer from "@/component/container/group";
import database from "@/util/database";
import {AppstoreAddOutlined, BarChartOutlined, ContainerOutlined, UserOutlined} from "@ant-design/icons";
import {notFound} from "next/navigation";
import {Col, Row} from "antd";

interface Props {
    params: Promise<{groupId: number}>
}

export const revalidate = 0;

const Page = async (props: Props) => {
    const groupId = Number((await props.params).groupId);
    const actions = [
        {title: "用户管理", icon: UserOutlined, to: "user"},
        {title: "商品管理", icon: AppstoreAddOutlined, to: "item"},
        {title: "订单管理", icon: ContainerOutlined, to: "order"},
        {title: "汇总", icon: BarChartOutlined, to: "summary"}
    ]
    const group = await database.group.findUnique({where: {id: groupId}});
    const userCount = await database.join.count({where: {groupId: groupId}});
    const itemCount = await database.item.count({where: {groupId: groupId, allowed: false}});
    const orderCount = await database.order.count({where: {item: {groupId: groupId}, status: "pending"}});
    const deliveryCount = await database.order.count({
        where: {
            item: {
                groupId: groupId
            },
            status: {
                not: "finished"
            }
        }
    });
    if (!group) return notFound();

    return (
        <GroupContainer title={group.name}>
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <GroupStatus user={userCount} item={itemCount} order={orderCount} delivery={deliveryCount}/>
                </Col>
                {
                    actions.map((action, index) => (
                        <ActionCard key={index} title={action.title} icon={action.icon} to={`${groupId}/${action.to}`}/>
                    ))
                }
            </Row>
        </GroupContainer>
    );
}

export default Page;

"use client";
import React from "react";
import ItemTable from "@/component/table/summary/item";
import UserTable from "@/component/table/summary/user";
import WeightTable from "@/component/table/summary/weight";
import SummaryStatus from "@/component/status/summary";
import {PageContainer} from "@ant-design/pro-layout";
import {User, Weight} from "@/type/summary";

interface Props {
    item: Record<string, unknown>[];
    user: User[];
    weight: Weight[];
}

const SummaryContainer = (props: Props) => {
    const [index, setIndex] = React.useState("user");
    let price = 0;
    let weight = 0;
    for (const i of props.user) {
        price += i.total;
    }
    for (const i of props.weight) {
        weight += i.total;
    }

    return (
        <PageContainer
            tabList={[
                {
                    tab: '用户',
                    key: 'user'
                },
                {
                    tab: '商品',
                    key: 'item'
                },
                {
                    tab: '重量',
                    key: 'weight',
                    disabled: props.weight?.length === 0
                }
            ]}
            onTabChange={(key) => {
                setIndex(key);
            }}
        >
            <SummaryStatus price={price} weight={weight}/>
            {
                index === "user" ? (
                    <UserTable data={props.user}/>
                ): index === "item" ? (
                    <ItemTable data={props.item}/>
                ): (
                    <WeightTable data={props.weight}/>
                )
            }
        </PageContainer>
    );
}

export default SummaryContainer;

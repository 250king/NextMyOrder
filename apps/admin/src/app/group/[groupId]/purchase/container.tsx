"use client";
import React from "react";
import OverviewTable from "@/component/data/summary/overview";
import ItemTable from "@/component/data/summary/item";
import UserTable from "@/component/data/summary/user";
import {PageContainer} from "@ant-design/pro-components";
import {GroupSchema} from "@repo/schema/group";

interface Props {
    data: GroupSchema,
}

const Container = (props: Props) => {
    const [index, setIndex] = React.useState("overview");

    return (
        <PageContainer
            tabList={[
                {
                    tab: "总览",
                    key: 'overview',
                },
                {
                    tab: '用户',
                    key: 'user',
                },
                {
                    tab: '商品',
                    key: 'item',
                },
            ]}
            onTabChange={(key) => {
                setIndex(key);
            }}
        >
            {
                index === "overview" ? (
                    <OverviewTable data={props.data}/>
                ) : index === "user" ? (
                    <UserTable data={props.data}/>
                ) : (
                    <ItemTable data={props.data}/>
                )
            }
        </PageContainer>
    );
};

export default Container;

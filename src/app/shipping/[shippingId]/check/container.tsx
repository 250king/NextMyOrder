"use client";
import React from "react";
import CheckTable from "@/component/data/shipping/check";
import TaxTable from "@/component/data/shipping/tax";
import FeeTable from "@/component/data/shipping/fee";
import {PageContainer} from "@ant-design/pro-layout";
import {ShippingSchema} from "@/type/shipping";

const Container = (props: {
    data: ShippingSchema,
}) => {
    const [index, setIndex] = React.useState("item");

    return (
        <PageContainer
            tabList={[
                {
                    tab: "验货",
                    key: 'item',
                },
                {
                    tab: '税费',
                    key: 'tax',
                },
                {
                    tab: '运费',
                    key: 'fee',
                },
            ]}
            onTabChange={(key) => {
                setIndex(key);
            }}
        >
            {
                index === "item" ? (
                    <CheckTable data={props.data}/>
                ) : index === "tax" ? (
                    <TaxTable data={props.data}/>
                ) : (
                    <FeeTable data={props.data}/>
                )
            }
        </PageContainer>
    );
};

export default Container;

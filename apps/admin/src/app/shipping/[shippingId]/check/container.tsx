"use client";
import React from "react";
import CheckTable from "@/component/data/shipping/check";
import FeeTable from "@/component/data/shipping/fee";
import TaxTable from "@/component/data/shipping/tax";
import {PageContainer} from "@ant-design/pro-layout";
import {ShippingSchema} from "@repo/schema/shipping";

const Container = (props: {
    data: ShippingSchema,
}) => {
    const [index, setIndex] = React.useState("check");

    return (
        <PageContainer
            tabList={[
                {
                    tab: "验货",
                    key: 'check',
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
                index === "check" ? (
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

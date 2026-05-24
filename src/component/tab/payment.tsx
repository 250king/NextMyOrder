"use client"
import React from "react";
import Link, { LinkProps } from "next/link";
import { Tabs } from "@heroui/react";
import { PaymentResult } from "@/type/payment";

export const PaymentTab = ({
    search,
    data,
}: {
    data: Omit<PaymentResult, "user">;
    search: {
        tab?: string;
    };
}) => {
    const currentTab = search.tab === "refund" ? "refund" : "detail";
    return (
        <Tabs selectedKey={currentTab} className="w-full">
            <Tabs.ListContainer className="w-fit max-w-full">
                <Tabs.List className="w-fit max-w-full *:w-fit *:whitespace-nowrap">
                    <Tabs.Tab
                        href={`/payments/${data.id}?tab=detail`}
                        id="detail"
                        render={(props) => <Link {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps)} />}
                    >
                        收款明细
                        <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab
                        href={`/payments/${data.id}?tab=refund`}
                        id="refund"
                        render={(props) => <Link {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps)} />}
                    >
                        退款详情
                        <Tabs.Indicator />
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs.ListContainer>
            <div className="w-full">
                <Tabs.Panel className="pt-4" id="detail">
                    <div className="min-h-48 rounded-lg border border-dashed border-separator p-6" />
                </Tabs.Panel>
                <Tabs.Panel className="pt-4" id="refund">
                    <div className="min-h-48 rounded-lg border border-dashed border-separator p-6" />
                </Tabs.Panel>
            </div>
        </Tabs>
    );
};

"use client"
import { Tabs } from "@heroui/react";
import { LinkTab } from "@/component/common/tab";
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
                    <LinkTab href={`/payments/${data.id}?tab=detail`} id="detail">
                        收款明细
                        <Tabs.Indicator />
                    </LinkTab>
                    <LinkTab href={`/payments/${data.id}?tab=refund`} id="refund">
                        退款详情
                        <Tabs.Indicator />
                    </LinkTab>
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

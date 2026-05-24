"use client"
import React from "react";
import Link, { LinkProps } from "next/link";
import { Tabs } from "@heroui/react";
import { DeliveryResult } from "@/type/delivery";

export const DeliveryTab = ({
    search,
    data,
}: {
    data: Omit<DeliveryResult, "user">;
    search: {
        tab?: string;
    };
}) => {
    const currentTab = search.tab === "goods" ? "goods" : "track";
    return (
        <Tabs selectedKey={currentTab} className="w-full">
            <Tabs.ListContainer className="w-fit max-w-full">
                <Tabs.List className="w-fit max-w-full *:w-fit *:whitespace-nowrap">
                    <Tabs.Tab
                        href={`/deliveries/${data.id}?tab=goods`}
                        id="goods"
                        render={(props) => <Link {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps)} />}
                    >
                        已绑定商品
                        <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab
                        href={`/deliveries/${data.id}?tab=track`}
                        id="track"
                        render={(props) => <Link {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps)} />}
                    >
                        物流跟踪
                        <Tabs.Indicator />
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs.ListContainer>
            <div className="w-full">
                <Tabs.Panel className="pt-4" id="goods">
                    <div className="min-h-48 rounded-lg border border-dashed border-separator p-6"/>
                </Tabs.Panel>
                <Tabs.Panel className="pt-4" id="track">
                    <div className="min-h-48 rounded-lg border border-dashed border-separator p-6" />
                </Tabs.Panel>
            </div>
        </Tabs>
    );
};

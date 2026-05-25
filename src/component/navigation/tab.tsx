"use client";

import React from "react";
import NextLink, { LinkProps } from "next/link";
import { Tabs } from "@heroui/react";

type LinkTabProps = React.ComponentProps<typeof Tabs.Tab> & {
    href: LinkProps["href"];
};

const renderNextLink = (props: unknown) => (
    <NextLink {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps)} />
);

export const LinkTab = ({ children, ...props }: LinkTabProps) => (
    <Tabs.Tab {...props} render={renderNextLink}>
        {children}
    </Tabs.Tab>
);

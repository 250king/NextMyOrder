"use client";

import React from "react";
import NextLink, { LinkProps } from "next/link";
import { Tabs } from "@heroui/react";

type LinkTabProps = React.ComponentProps<typeof Tabs.Tab> & {
    href: LinkProps["href"];
};

export const LinkTab = ({ children, ...props }: LinkTabProps) => (
    <Tabs.Tab {...props} render={(p) => <NextLink {...(p as any)} replace />}>
        {children}
    </Tabs.Tab>
);

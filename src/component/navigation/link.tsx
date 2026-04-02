import React from "react";
import { LinkProps } from "next/link";
import NextLink from "next/link";
import { linkVariants } from "@heroui/styles";

export const Link = ({
    children,
    href,
    isActive,
    ...props
}: React.PropsWithChildren<
    LinkProps & {
        isActive: boolean;
    }
>) => {
    const slots = linkVariants();
    return (
        <NextLink className={`${slots.base()} ${isActive ? "text-primary font-semibold": ""}`} href={href} {...props}>
            {children}
        </NextLink>
    );
};

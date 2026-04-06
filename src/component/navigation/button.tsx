import React from "react";
import Link, { LinkProps } from "next/link";
import { Button, ButtonProps } from "@heroui/react";

export const LinkButton = ({ children, href, ...props }: ButtonProps & LinkProps) => {
    return (
        <Button
            {...props}
            render={(prop) => <Link href={href} {...(prop as unknown as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>)} />}
        >
            {children}
        </Button>
    );
};

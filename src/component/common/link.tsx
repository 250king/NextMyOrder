"use client";
import React from "react";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { Button, ButtonProps, Dropdown, DropdownItemProps } from "@heroui/react";

type LinkButtonProps = (ButtonProps & { back: true; href?: never }) | (ButtonProps & { back?: false } & LinkProps);

type LinkDropdownItemProps = (DropdownItemProps & { back: true; href?: never }) | (DropdownItemProps & { back?: false } & LinkProps);

export const LinkButton = ({ children, href, back, ...props }: LinkButtonProps) => {
    const router = useRouter();
    if (back) {
        return (
            <Button {...props} onPress={() => router.back()}>
                {children}
            </Button>
        );
    }
    return (
        <Button
            {...props}
            render={(prop) => (
                <Link
                    {...(prop as unknown as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>)}
                    href={href}
                />
            )}
        >
            {children}
        </Button>
    );
};

export const LinkDropdownItem = ({ children, href, back, ...props }: LinkDropdownItemProps) => {
    const router = useRouter();
    if (back) {
        return (
            <Dropdown.Item {...props} onPress={() => router.back()}>
                {children}
            </Dropdown.Item>
        )
    }
    return (
        <Dropdown.Item
            {...props}
            render={(prop) => (
                <Link
                    {...(prop as unknown as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>)}
                    href={href}
                />
            )}
        >
            {children}
        </Dropdown.Item>
    );
};

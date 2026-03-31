"use client";
import { usePathname } from "next/navigation";
import { Avatar, Button, Dropdown } from "@heroui/react";
import { Link } from "@/component/navigation/link";
import { Context } from "@/type/context";

export const Navbar = ({ user, isAdmin }: Omit<Context, "accessToken">) => {
    const pathname = usePathname();
    const navItems = [
        ...(isAdmin ? [{ name: "用户", href: "/users" }]: []),
        { name: "团购", href: "/groups" },
        { name: "国际运输", href: "/shipping" },
        { name: "分发", href: "/deliveries"},
        { name: "账单", href: "/payments" },
    ];

    return (
        <nav className="border-separator bg-background/70 sticky top-0 z-40 w-full border-b backdrop-blur-lg">
            <header className="container mx-auto flex h-16 items-center px-6 gap-8">
                <div className="flex items-center gap-4 shrink-0">
                    <Button isIconOnly className="md:hidden" variant="secondary">
                        <span className="icon-[ri--list-unordered]" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <p className="font-bold">耀の小店</p>
                    </div>
                </div>
                <ul className="hidden items-center gap-6 md:flex">
                    {navItems.map((item) => {
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    isActive={
                                        pathname === item.href ||
                                        pathname?.startsWith(`${item.href}/`)
                                    }
                                >
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                {!user || (
                    <ul className="ml-auto flex items-center gap-4">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <Avatar className="transition-transform">
                                    <Avatar.Image
                                        src={`https://q.qlogo.cn/g?b=qq&nk=${user.custom_data.qq}&s=100`}
                                    />
                                </Avatar>
                            </Dropdown.Trigger>
                            <Dropdown.Popover className="min-w-40">
                                <Dropdown.Menu className="min-w-40">
                                    <Dropdown.Item
                                        key="profile"
                                        className="h-14 gap-2 whitespace-nowrap"
                                    >
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <p className="font-semibold whitespace-nowrap">
                                                当前登录
                                            </p>
                                            <p className="text-primary font-semibold whitespace-nowrap">
                                                {user.name}
                                            </p>
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        key="logout"
                                        variant="danger"
                                        href="/logout"
                                        className="text-danger whitespace-nowrap"
                                    >
                                        退出登录
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                    </ul>
                )}
            </header>
        </nav>
    );
};

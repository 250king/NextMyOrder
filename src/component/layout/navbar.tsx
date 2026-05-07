"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Button, Drawer, Dropdown } from "@heroui/react";
import { Context } from "@/type/common";

export const Navbar = ({ user }: Omit<Context, "accessToken" | "uid">) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    /*
    const adminList = [
        { name: "首页", href: "/home" },
        { name: "用户", href: "/users" },
        { name: "团购", href: "/groups" },
        { name: "国际运输", href: "/shipping" },
    ];
    */
    const navItems = [{ name: "分发", href: "/deliveries" }, { name: "账单", href: "/payments" }];

    const getNavClassName = (href: string) => {
        const isActive = pathname === href || pathname?.startsWith(`${href}/`);
        return isActive ? "text-focus font-semibold" : "";
    };

    return (
        <nav className="border-separator bg-background/70 sticky top-0 z-40 w-full border-b backdrop-blur-lg">
            <header className="container mx-auto flex h-16 items-center gap-8 px-6">
                <div className="flex shrink-0 items-center gap-4">
                    <Button isIconOnly className="md:hidden" variant="secondary" onPress={() => setIsDrawerOpen(true)}>
                        <span className="icon-[ri--list-unordered]" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <p className="font-bold">耀の小店</p>
                    </div>
                </div>
                <ul className="hidden items-center gap-6 md:flex">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href} className={getNavClassName(item.href)}>
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
                {!user || (
                    <ul className="ml-auto flex items-center gap-4">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <Avatar className="transition-transform">
                                    <Avatar.Image src={`https://q.qlogo.cn/g?b=qq&nk=${user.custom_data.qq}&s=100`} />
                                </Avatar>
                            </Dropdown.Trigger>
                            <Dropdown.Popover className="min-w-40">
                                <Dropdown.Menu className="min-w-40">
                                    <Dropdown.Item key="profile">
                                        <div className="flex flex-col gap-2">
                                            <p className="font-semibold whitespace-nowrap">当前登录</p>
                                            <p className="text-primary whitespace-nowrap">{user.name}</p>
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => router.replace("/me")} key="me" className="whitespace-nowrap">
                                        个人中心
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => router.replace("/logout")} key="logout" className="text-danger whitespace-nowrap">
                                        退出登录
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                    </ul>
                )}
            </header>
            <Drawer>
                <Drawer.Backdrop isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <Drawer.Content placement="left" className="md:hidden">
                        <Drawer.Dialog aria-label="导航菜单">
                            <Drawer.CloseTrigger />
                            <Drawer.Header>
                                <Drawer.Heading>导航菜单</Drawer.Heading>
                            </Drawer.Header>
                            <Drawer.Body>
                                <nav className="flex flex-col gap-1">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-default ${getNavClassName(item.href)}`}
                                            onClick={() => setIsDrawerOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </nav>
                            </Drawer.Body>
                        </Drawer.Dialog>
                    </Drawer.Content>
                </Drawer.Backdrop>
            </Drawer>
        </nav>
    );
};

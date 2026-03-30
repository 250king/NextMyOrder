import { Avatar, Dropdown } from "@heroui/react";
import type { UserInfo } from "@/type/user";

export const Navbar = ({ profile }: { profile?: UserInfo }) => {
    return (
        <nav className="border-separator bg-background/70 sticky top-0 z-40 w-full border-b backdrop-blur-lg">
            <header className="container mx-auto flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <p className="font-bold">耀の小店</p>
                </div>
                <ul className="flex items-center gap-4">
                    {!profile || (
                        <Dropdown>
                            <Dropdown.Trigger>
                                <Avatar className="transition-transform">
                                    <Avatar.Image
                                        src={`https://q.qlogo.cn/g?b=qq&nk=${profile.custom_data.qq}&s=100`}
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
                                                {profile.name}
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
                    )}
                </ul>
            </header>
        </nav>
    );
};

"use client";
import React from "react";
import Link from "next/link";
import {SettingOutlined, ShoppingCartOutlined, TruckOutlined, UserOutlined} from "@ant-design/icons";
import {ProLayout} from "@ant-design/pro-layout";
import {usePathname} from "next/navigation";
import {ConfigProvider, theme} from "antd";

interface Props {
    children: React.ReactNode;
}

const Layout = (props: Props) => {
    const [isDark, setIsDark] = React.useState(false);
    const pathname = usePathname();
    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        setIsDark(mediaQuery.matches);
        mediaQuery.addEventListener('change', handler);
        return () => {
            mediaQuery.removeEventListener('change', handler)
        };
    }, []);

    return (
        <ConfigProvider theme={{algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm}}>
            <ProLayout
                layout="top"
                logo={null}
                location={{pathname}}
                title="NextMyOrder"
                route={{
                    path: "/",
                    routes: [
                        {
                            path: "/group",
                            name: "团购",
                            icon: <ShoppingCartOutlined/>,
                            children: [
                                {
                                    path: "/group/:groupId",
                                    name: "团购管理",
                                    hideInMenu: true
                                },
                                {
                                    path: "/group/:groupId/user/:userId",
                                    name: "用户管理",
                                    hideInMenu: true
                                },
                                {
                                    path: "/group/:groupId/summary",
                                    name: "报表",
                                    hideInMenu: true
                                }
                            ]
                        },
                        {
                            path: "/user",
                            name: "用户",
                            icon: <UserOutlined/>
                        },
                        {
                            path: "/delivery",
                            name: "分发",
                            icon: <TruckOutlined/>,
                            children: [
                                {path: "/delivery/create", name: "创建运单", hideInMenu: true},
                            ]
                        },
                        /* todo:因为无法过审暂停
                        {
                            path: "/payment",
                            name: "账单",
                            icon: <PayCircleOutlined/>
                        },
                        */
                        {
                            path: "/setting",
                            name: "设置",
                            icon: <SettingOutlined/>
                        }
                    ]
                }}
                breadcrumbRender={(routes = []) => routes}
                itemRender={(route) => <Link href={route.path!}>{route.title}</Link>}
                menuItemRender={(item, defaultDom) => (
                    <Link href={item.path || "/"}>
                        {defaultDom}
                    </Link>
                )}
            >
                {props.children}
            </ProLayout>
        </ConfigProvider>
    );
}

export default Layout;

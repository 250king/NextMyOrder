"use client";
import React from "react";
import Link from "next/link";
import {HomeOutlined, PayCircleOutlined, ShoppingCartOutlined, TruckOutlined, UserOutlined} from "@ant-design/icons";
import {ConfigProvider, theme} from "antd";
import {ProLayout} from "@ant-design/pro-layout";
import {usePathname} from "next/navigation";

interface Props {
    children: React.ReactNode;
}

const Layout = (props: Props) => {
    const [isDark, setIsDark] = React.useState(false);
    const pathname = usePathname();
    React.useEffect(
        () => {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            setIsDark(mediaQuery.matches);
            const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        },
        []
    );

    return (
        <ConfigProvider theme={{algorithm: isDark ? theme.darkAlgorithm: theme.defaultAlgorithm}}>
            <ProLayout
                layout="top"
                location={{pathname}}
                title="NextMyOrder"
                logo="https://p.qlogo.cn/gh/387665635/387665635/40/"
                route={{
                    path: "/",
                    routes: [
                        {path: "/", name: "首页", icon: <HomeOutlined/>},
                        {path: "/user", name: "用户", icon: <UserOutlined/>},
                        {
                            path: "/group",
                            name: "团购",
                            icon: <ShoppingCartOutlined />,
                            children: [
                                {path: "/group/:groupId", name: "团购管理", hideInMenu: true},
                                {path: "/group/:groupId/item", name: "商品管理", hideInMenu: true},
                                {path: "/group/:groupId/user", name: "用户管理", hideInMenu: true},
                                {path: "/group/:groupId/order", name: "订单管理", hideInMenu: true},
                                {path: "/group/:groupId/summary", name: "汇总", hideInMenu: true}
                            ]
                        },
                        {
                            path: "/delivery",
                            name: "分发",
                            icon: <TruckOutlined/>,
                            children: [
                                {path: "/delivery/create", name: "创建运单", hideInMenu: true},
                            ]
                        },
                        {path: "/payment", name: "账单", icon: <PayCircleOutlined/>}
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

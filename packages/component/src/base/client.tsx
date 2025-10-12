"use client";
import React from "react";
import Link from "next/link";
import {Route} from "@ant-design/pro-layout/lib/typing";
import {DefaultFooter, ProLayout} from "@ant-design/pro-components";
import {usePathname} from "next/navigation";
import {ConfigProvider, theme} from "antd";

const ClientLayout = (props: React.PropsWithChildren & {
    route: Route,
    title: string | null,
    logo: string | null,
}) => {
    const [isDark, setIsDark] = React.useState(false);
    const pathname = usePathname();
    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        setIsDark(mediaQuery.matches);
        mediaQuery.addEventListener('change', handler);
        return () => {
            mediaQuery.removeEventListener('change', handler);
        };
    }, []);

    return (
        <ConfigProvider theme={{algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm}}>
            <ProLayout

                layout="top"
                logo={props.logo}
                location={{pathname}}
                title={props.title || "NextMyOrder"}
                route={props.route}
                breadcrumbRender={(routes = []) => routes}
                itemRender={(route) => <Link href={route.path!}>{route.title}</Link>}
                menuItemRender={( item, defaultDom) => (
                    <Link href={item.path!}>
                        {defaultDom}
                    </Link>
                )}
                footerRender={() => (
                    <DefaultFooter copyright="250king, Powered by NextMyOrder"/>
                )}
            >
                {props.children}
            </ProLayout>
        </ConfigProvider>
    );
};

export default ClientLayout;

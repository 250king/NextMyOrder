import React, { Children } from "react";
import '@ant-design/v5-patch-for-react-19';
import BaseLayout from "@repo/component/base/layout";
import {AntdRegistry} from "@ant-design/nextjs-registry";
import {getSetting} from "@repo/util/data/setting";
import {Metadata} from "next";
import {App} from "antd";
import {
    MailOutlined,
    PayCircleOutlined,
    SettingOutlined,
    ShoppingCartOutlined,
    TruckOutlined,
    UserOutlined,
} from "@ant-design/icons";
import path from "path";

export const dynamic = "force-dynamic";

export const generateMetadata = async () : Promise<Metadata> => {
    const setting = await getSetting();
    return {
        title: setting.title || "NextMyOrder",
        icons: {
            icon: setting.logo || "",
        },
    };
};

const Layout = (props: React.PropsWithChildren) => {
    const router = {
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
                        hideInMenu: true,
                    },
                    {
                        path: "/group/:groupId/list/:userId",
                        name: "需求单管理",
                        hideInMenu: true,
                    },
                    {
                        path: "/group/:groupId/purchase",
                        name: "采购汇总",
                        hideInMenu: true,
                    },
                ],
            },
            {
                path: "/user",
                name: "用户",
                icon: <UserOutlined/>,
                children: [
                    {
                        path: "/user/:userId",
                        name: "用户详情",
                        hideInMenu: true,
                    },
                ],
            },
            {
                path: "/shipping",
                name: "运输",
                icon: <MailOutlined/>,
                children: [
                    {
                        path: "/shipping/create",
                        name: "创建运单",
                        hideInMenu: true,
                    },
                    {
                        path: "/shipping/:shippingId",
                        name: "运单详情",
                        hideInMenu: true,
                    },
                    {
                        path: "/shipping/:shippingId/check",
                        name: "检查汇总",
                        hideInMenu: true,
                    },
                ],
            },
            {
                path: "/delivery",
                name: "分发",
                icon: <TruckOutlined/>,
                children: [
                    {
                        path: "/delivery/create",
                        name: "创建运单",
                        hideInMenu: true,
                    },
                    {
                        path: "/delivery/:deliveryId",
                        name: "运单详情",
                        hideInMenu: true,
                    },
                ],
            },
            {
                path: "/payment",
                name: "账单",
                icon: <PayCircleOutlined/>,
                children:[
                    {
                        path: "/payment/create/",
                        name: '添加账单',
                        hideInMenu: true,
                    },
                    {
                        path: "/payment/create/batch",
                        name: '批量添加账单',
                        hideInMenu: true,
                    },
                ]
            },
            {
                path: "/setting",
                name: "设置",
                icon: <SettingOutlined/>,
            },
        ],
    };
    return (
        <html lang="zh-Hans">
            <body>
                <AntdRegistry>
                    <App>
                        <BaseLayout route={router}>
                            {props.children}
                        </BaseLayout>
                    </App>
                </AntdRegistry>
            </body>
        </html>
    );
};

export default Layout;

import React from "react";
import {AntdRegistry} from "@ant-design/nextjs-registry";
import {Metadata} from "next";
import {App} from "antd";
import '@ant-design/v5-patch-for-react-19';

interface Props {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: "NextMyOrder",
}

const Layout = (props: Props) => {
    return (
        <html lang="zh-Hans">
            <body>
            <AntdRegistry>
                <App>
                    {props.children}
                </App>
            </AntdRegistry>
            </body>
        </html>
    );
}

export default Layout;

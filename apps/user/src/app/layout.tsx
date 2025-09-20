import React from "react";
import '@ant-design/v5-patch-for-react-19';
import BaseLayout from "@repo/component/base/layout";
import {AntdRegistry} from "@ant-design/nextjs-registry";
import {Metadata} from "next";
import {App} from "antd";

export const metadata: Metadata = {
    title: "NextMyOrder",
};

const Layout = (props: React.PropsWithChildren) => {
    return (
        <html lang="zh-Hans">
            <body>
                <AntdRegistry>
                    <App>
                        <BaseLayout route={{}}>
                            {props.children}
                        </BaseLayout>
                    </App>
                </AntdRegistry>
            </body>
        </html>
    );
};

export default Layout;

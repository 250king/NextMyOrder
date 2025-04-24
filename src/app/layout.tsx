import React from "react";
import {Metadata} from "next";

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
                {props.children}
            </body>
        </html>
    );
}

export default Layout;

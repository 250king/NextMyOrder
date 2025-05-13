import React from "react";
import BaseLayout from "@/component/layout";

interface Props {
    children: React.ReactNode;
}

const Layout = (props: Props) => {
    return (
        <BaseLayout>
            {props.children}
        </BaseLayout>
    );
}

export default Layout;

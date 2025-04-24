import React from "react";
import BaseLayout from "@/component/layout";
import CssBaseline from "@mui/material/CssBaseline";
import Navbar from "@/component/navbar";

interface Props {
    children: React.ReactNode;
}

const Layout = (props: Props) => {
    return (
        <BaseLayout>
            <CssBaseline/>
            <Navbar/>
            {props.children}
        </BaseLayout>
    );
}

export default Layout;

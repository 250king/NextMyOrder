import React from "react";
import ClientLayout from "./client";
import {Route} from "@ant-design/pro-layout/lib/typing";
import {getSetting} from "@repo/util/data/setting";

const BaseLayout = async (props: React.PropsWithChildren & {
    route: Route,
}) => {
    const setting = await getSetting();
    return (
        <ClientLayout route={props.route} title={setting.title} logo={setting.logo}>
            {props.children}
        </ClientLayout>
    );
};

export default BaseLayout;

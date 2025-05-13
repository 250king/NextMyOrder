"use client";
import React from "react";
import {PageContainer} from "@ant-design/pro-layout";

interface Props {
    title: string;
    children: React.ReactNode;
}

const GroupContainer = (props: Props) => {
    return (
        <PageContainer title={props.title}>
            {props.children}
        </PageContainer>
    );
}

export default GroupContainer;

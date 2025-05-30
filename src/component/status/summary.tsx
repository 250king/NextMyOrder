"use client";

import React from "react";
import RcResizeObserver from 'rc-resize-observer';
import {ProCard} from "@ant-design/pro-components";
import {Divider, Statistic} from "antd";

interface Props {
    price: number;
    weight: number;
}

const SummaryStatus = (props: Props) => {
    const [responsive, setResponsive] = React.useState(false);

    return (
        <RcResizeObserver onResize={(offset) => setResponsive(offset.width < 596)}>
            <ProCard.Group direction={responsive ? 'column' : 'row'} style={{marginBottom: 24}}>
                <ProCard>
                    <Statistic title="总额" value={props.price} prefix={"￥"}/>
                </ProCard>
                <Divider type={responsive ? 'horizontal' : 'vertical'}/>
                <ProCard>
                    <Statistic title="总重" value={props.weight} suffix={"g"}/>
                </ProCard>
            </ProCard.Group>
        </RcResizeObserver>
    );
}

export default SummaryStatus;

"use client";
import React from "react";
import debounce from 'lodash/debounce';
import trpc from "@/server/client";
import {Select, Spin, Typography} from "antd";
import type {SelectProps} from "antd";

const GroupSelector = (props: {
    value?: number,
    onChange?: (value: number) => void,
    hiddenEnded?: boolean,
    shippingId?: number,
}) => {
    const [fetching, setFetching] = React.useState(true);
    const [options, setOptions] = React.useState<SelectProps["options"]>([]);
    const debouncedFetch = React.useMemo(
        () => {
            const fetcher = (search: string) => {
                setFetching(true);
                trpc.groupGetAll.query({
                    filter: [
                        {field: "ended", operator: "eq", value: !props.hiddenEnded},
                        ...(props.shippingId? [{field: "shippingId", operator: "eq" as const, value: props.shippingId}]: []),
                    ],
                    search: search ?? "",
                }).then(res => {
                    setOptions(
                        res.items.map((item) => ({
                            ...item,
                            label: item.name,
                            value: item.id,
                        })),
                    );
                }).finally(() => setFetching(false));
            };
            return debounce(fetcher, 500);
        },
        [props.hiddenEnded, props.shippingId],
    );
    React.useEffect(
        () => {
            debouncedFetch("");
            return () => debouncedFetch.cancel();
        },
        [debouncedFetch],
    );

    return (
        <Select
            showSearch
            allowClear
            value={props.value}
            options={options}
            onChange={props.onChange}
            placeholder="请选择"
            filterOption={false}
            style={{width: 350}}
            onSearch={debouncedFetch}
            notFoundContent={fetching ? <Spin size="small"/> : undefined}
            optionRender={(option) => {
                return (
                    <div>
                        <Typography>{option.label}</Typography>
                        <Typography style={{fontSize: 12}}>{option.data.qq}</Typography>
                    </div>
                );
            }}
        />
    );
};

export default GroupSelector;

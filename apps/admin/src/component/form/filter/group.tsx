"use client";
import React from "react";
import debounce from 'lodash/debounce';
import trpc from "@/trpc/client";
import {useParams, usePathname} from "next/navigation";
import {dc, dd, sc, sd} from "@/component/match";
import {Select, Spin, Typography} from "antd";
import {Filter} from "@repo/util/data/query";
import type {SelectProps} from "antd";

const GroupFilter = (props: {
    value?: number,
    onChange?: (value: number) => void,
    isShow?: boolean,
    userId?: number | null, // 指定用户ID
}) => {
    const params = useParams();
    const pathname = usePathname();
    const [fetching, setFetching] = React.useState(true);
    const [options, setOptions] = React.useState<SelectProps["options"]>([]);
    const debouncedFetch = React.useMemo(
        () => {
            const fetcher = (search: string) => {
                setFetching(true);
                const filter : Filter = [];
                if (sd(pathname)) {
                    if (props.isShow) {
                        filter.push({field: "items.some.orders.some.shippingId", operator: "eq", value: null});
                        filter.push({field: "ended", operator: "eq", value: false});
                    } else {
                        filter.push({field: "items.some.orders.some.shippingId", operator: "eq", value: Number(params.shippingId)});
                    }
                }
                if (sc(pathname)) {
                    filter.push({field: "items.some.orders.some.shippingId", operator: "eq", value: null});
                    filter.push({field: "ended", operator: "eq", value: false});
                }
                if (dc(pathname) || dd(pathname)) {
                    filter.push({field: "ended", operator: "eq", value: false});
                }
                if (props.userId) {
                    filter.push({field: "items.some.orders.some.userId", operator: "eq", value: props.userId});
                }
                trpc.groupGetAll.query({
                    filter: filter,
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
        [params.shippingId, pathname, props.isShow, props.userId],
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

export default GroupFilter;

"use client";
import React from "react";
import debounce from 'lodash/debounce';
import trpc from "@/trpc/client";
import {Avatar, Select, Space, Spin, Typography} from "antd";
import {dc, dd, ls, sc, sd} from "@/component/match";
import {useParams, usePathname} from "next/navigation";
import {Filter} from "@repo/util/data/query";
import type {SelectProps} from "antd";

const UserFilter = (props: {
    value?: number,
    onChange?: (value: number) => void,
    isShow?: boolean, // 是否只显示未分配用户
}) => {
    const pathname = usePathname();
    const params = useParams();
    const [fetching, setFetching] = React.useState(true);
    const [options, setOptions] = React.useState<SelectProps["options"]>([]);
    const debouncedFetch = React.useMemo(
        () => {
            const fetcher = (search: string) => {
                setFetching(true);
                const filter : Filter = [];
                if (ls(pathname)) {
                    filter.push({field: "lists.some.groupId", operator: "eq", value: Number(params.groupId)});
                }
                if (sd(pathname)) {
                    if (props.isShow) {
                        filter.push({field: "orders.some.shippingId", operator: "eq", value: null});
                        filter.push({field: "lists.some.group.ended", operator: "eq", value: false});
                    } else {
                        filter.push({field: "orders.some.shippingId", operator: "eq", value: Number(params.shippingId)});
                    }
                }
                if (sc(pathname)) {
                    filter.push({field: "orders.some.shippingId", operator: "eq", value: null});
                    filter.push({field: "lists.some.group.ended", operator: "eq", value: false});
                }
                if (dc(pathname) || dd(pathname)) {
                    filter.push({field: "lists.some.group.ended", operator: "eq", value: false});
                }
                trpc.userGetAll.query({
                    filter: filter,
                    search: search ?? "",
                }).then(data => {
                    setOptions(
                        data.items.map((data) => ({
                            ...data,
                            label: data.name,
                            value: data.id,
                        })),
                    );
                }).finally(() => setFetching(false));
            };
            return debounce(fetcher, 500);
        },
        [params.groupId, params.shippingId, pathname, props.isShow],
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
                    <Space size="middle" align="center">
                        <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${option.data.qq}&s=0`}/>
                        <div>
                            <Typography>{option.label}</Typography>
                            <Typography style={{fontSize: 12}}>{option.data.qq}</Typography>
                        </div>
                    </Space>
                );
            }}
        />
    );
};

export default UserFilter;

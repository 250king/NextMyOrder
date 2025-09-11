"use client";
import React from "react";
import debounce from 'lodash/debounce';
import trpc from "@/server/client";
import {Avatar, Select, Space, Spin, Typography} from "antd";
import {useParams} from "next/navigation";
import type {SelectProps} from "antd";

interface Props {
    value?: number,
    onChange?: (value: number) => void,
}

const UserSelector = (props: Props) => {
    const params = useParams();
    const [fetching, setFetching] = React.useState(true);
    const [options, setOptions] = React.useState<SelectProps["options"]>([]);
    const debouncedFetch = React.useMemo(
        () => {
            const fetcher = (search: string) => {
                setFetching(true);
                const method = params.groupId? trpc.listGetAll: trpc.userGetAll;
                method.query({
                    filter: params.groupId ? [
                        {field: "groupId", operator: "eq", value: Number(params.groupId)},
                    ] : [],
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
        [params.groupId],
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

export default UserSelector;

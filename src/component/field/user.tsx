"use client";
import React from "react";
import debounce from 'lodash/debounce';
import trpc from "@/server/client";
import {Avatar, Select, Space, Spin, Typography} from "antd";
import {useParams} from "next/navigation";
import {UserSchema} from "@/type/user";
import {JoinData} from "@/type/group";
import type {SelectProps} from "antd";

interface Props {
    value?: number;
    onChange?: (value: number) => void;
}

const UserSelector = (props: Props) => {
    const params = useParams();
    const [fetching, setFetching] = React.useState(true);
    const [options, setOptions] = React.useState<SelectProps["options"]>([]);
    const debouncedFetch = React.useMemo(
        () => {
            const fetcher = (search: string) => {
                setFetching(true);
                const method = params.groupId? trpc.group.user: trpc.user;
                method.get.query({
                    params: {
                        keyword: search
                    },
                    sort: params.groupId? {
                        userId: "ascend"
                    }: {},
                    groupId: Number(params.groupId)
                }).then(data => {
                    setOptions(
                        params.groupId? (data.items as unknown as JoinData[]).map((data) => ({
                            ...data,
                            label: data.user.name,
                            value: data.userId,
                        })): (data.items as unknown as UserSchema[]).map((data) => ({
                            ...data,
                            label: data.name,
                            value: data.id,
                        }))
                    );
                }).finally(() => setFetching(false));
            };
            return debounce(fetcher, 500)
        },
        [params.groupId]
    );
    React.useEffect(
        () => {
            debouncedFetch("");
            return () => debouncedFetch.cancel();
        },
        [debouncedFetch]
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
                const qq = params.groupId ? option.data.user.qq : option.data.qq;
                return (
                    <Space size="middle" align="center">
                        <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=0`}/>
                        <div>
                            <Typography>{option.label}</Typography>
                            <Typography style={{fontSize: 12}}>{qq}</Typography>
                        </div>
                    </Space>
                );
            }}
        />
    );
};

export default UserSelector;

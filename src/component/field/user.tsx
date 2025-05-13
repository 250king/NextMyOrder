"use client";
import React from "react";
import debounce from 'lodash/debounce';
import {Avatar, Select, Space, Spin, Typography} from "antd";
import {useParams} from "next/navigation";
import {JoinDetail} from "@/type/join";
import type {SelectProps} from "antd";
import {User} from "@prisma/client";

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
                let endpoint;
                if (params.groupId) {
                    endpoint = `/api/group/${params.groupId}/user?keyword=${search}`;
                }
                else {
                    endpoint = `/api/user?keyword=${search}`
                }
                fetch(endpoint).then(res => {
                    if (!res.ok) {
                        setFetching(false);
                        return;
                    }
                    res.json().then(data => {
                        setOptions(
                            params.groupId? (data.items as JoinDetail[]).map((data) => ({
                                ...data,
                                label: data.user.name,
                                value: data.userId,
                            })): (data.items as User[]).map((data) => ({
                                ...data,
                                label: data.name,
                                value: data.id,
                            }))
                        );
                        setFetching(false);
                    })
                });
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
                const qq = params.groudId ? option.data.user.qq : option.data.qq;
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

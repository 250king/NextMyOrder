"use client";
import React from "react";
import debounce from 'lodash/debounce';
import trpc from "@/server/client";
import {Select, Spin, Typography} from "antd";
import {useParams} from "next/navigation";
import type {SelectProps} from "antd";
import {Item} from "@prisma/client";
import {cStd} from "@/util/string";

interface Props {
    value?: number,
    onChange?: (value: number) => void,
}

const ItemSelector = (props: Props) => {
    const params = useParams();
    const [fetching, setFetching] = React.useState(true);
    const [options, setOptions] = React.useState<SelectProps["options"]>([]);
    const debouncedFetch = React.useMemo(
        () => {
            const fetcher = (search: string) => {
                setFetching(true);
                trpc.itemGetAll.query({
                    filter: [
                        {field: "groupId", operator: "eq", value: Number(params.groupId)},
                    ],
                    search: search ?? "",
                }).then(res => {
                    setOptions(
                        res.items.map((item: Item) => ({
                            ...item,
                            label: item.name,
                            value: item.id,
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
                    <div>
                        <Typography>{option.data.name}</Typography>
                        <Typography style={{fontSize: 12}}>{cStd(option.data.price)}</Typography>
                    </div>
                );
            }}
        />
    );
};

export default ItemSelector;

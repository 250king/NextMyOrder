"use client";
import React from "react";
import debounce from 'lodash/debounce';
import {Select, Spin, Typography} from "antd";
import {currencyFormat} from "@/util/string";
import {useParams} from "next/navigation";
import {Item} from "@prisma/client";
import type {SelectProps} from "antd";

interface Props {
    value?: number;
    onChange?: (value: number) => void;
}

const ItemSelector = (props: Props) => {
    const params = useParams();
    const [fetching, setFetching] = React.useState(true);
    const [options, setOptions] = React.useState<SelectProps["options"]>([]);
    const debouncedFetch = React.useMemo(
        () => {
            const fetcher = (search: string) => {
                setFetching(true);
                fetch(`/api/group/${params.groupId}/item?keyword=${search}`).then(res => {
                    if (!res.ok) {
                        setFetching(false);
                        return;
                    }
                    res.json().then(data => {
                        setOptions(
                            data.items.map((item: Item) => ({
                                ...item,
                                label: item.name,
                                value: item.id
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
                return (
                    <div>
                        <Typography>{option.data.name}</Typography>
                        <Typography style={{fontSize: 12}}>{currencyFormat(option.data.price)}</Typography>
                    </div>
                );
            }}
        />
    );
};

export default ItemSelector;

"use client";
import React from "react";
import { Avatar } from "@heroui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { HeroTable } from "src/component/common/common";
import { SearchFilter, useFilter } from "src/component/common/filter";
import { Loading } from "src/component/common/loading";
import { LinkButton } from "src/component/navigation/button";
import { date } from "src/util/string";
import { FindAll4Params, UserResponse } from "@/api/model";

type TableProps = FindAll4Params & {
    items: UserResponse[];
    total: number;
};

const columnHelper = createColumnHelper<UserResponse>();

const columns = [
    columnHelper.accessor("id", {
        header: "ID",
        meta: {
            width: 80,
        },
    }),
    columnHelper.accessor("name", {
        header: "用户名",
        meta: {
            width: 330,
        },
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar size="sm">
                    <Avatar.Image src={`https://q.qlogo.cn/g?b=qq&nk=${row.original.qq}&s=100`} />
                </Avatar>
                <div className="min-w-0">
                    <div className="truncate font-medium">{row.original.name}</div>
                    <div className="text-default-500 text-xs truncate">{row.original.qq}</div>
                </div>
            </div>
        ),
    }),
    columnHelper.accessor("email", {
        header: "邮箱",
        meta: {
            width: 330,
        },
    }),
    columnHelper.accessor("creditScore", {
        header: "信用分",
    }),
    columnHelper.accessor("createdAt", {
        header: "注册时间",
        cell: ({ getValue }) => date(getValue()),
    }),
    columnHelper.accessor("updatedAt", {
        header: "更新时间",
        cell: ({ getValue }) => date(getValue()),
    }),
    columnHelper.display({
        id: "action",
        header: "操作",
        meta: {
            width: 140,
        },
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <LinkButton href={`/users/${row.original.id}`} isIconOnly size="sm" variant="tertiary">
                    <span className="icon-[ri--settings-3-fill]" />
                </LinkButton>
            </div>
        ),
    }),
];

export const UserTable = ({ items, total, page, sort, order, keyword }: TableProps) => {
    const [isPending, startTransition] = React.useTransition();
    const { updateFilter } = useFilter(startTransition);

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <SearchFilter initialValue={keyword} onSearch={(val) => updateFilter({ keyword: val })} />
            <HeroTable
                startTransition={startTransition}
                columns={columns}
                rowHeader="user_name"
                items={items}
                total={total}
                page={page}
                sort={sort}
                order={order}
            />
        </div>
    );
};

"use client";
import React from "react";
import { Avatar, Button } from "@heroui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { GetMembersParams, MemberResponse } from "@/api/model";
import { KeywordFilters } from "@/component/filter/keyword";
import { Loading } from "@/component/filter/loading";
import { HeroTable } from "@/component/table/common";
import { date } from "@/util/string";

type TableProps = GetMembersParams & {
    items: MemberResponse[];
    total: number;
};

const columnHelper = createColumnHelper<MemberResponse>();

const columns = [
    columnHelper.accessor("user.id", {
        header: "ID",
        meta: {
            width: 80,
        },
    }),
    columnHelper.accessor("user.name", {
        header: "用户名",
        meta: {
            width: 330,
        },
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar size="sm">
                    <Avatar.Image src={`https://q.qlogo.cn/g?b=qq&nk=${row.original.user.qq}&s=100`} />
                </Avatar>
                <div className="min-w-0">
                    <div className="truncate font-medium">{row.original.user.name}</div>
                    <div className="text-default-500 text-xs truncate">{row.original.user.qq}</div>
                </div>
            </div>
        ),
    }),
    columnHelper.accessor("user.email", {
        header: "邮箱",
        meta: {
            width: 330,
        },
    }),
    columnHelper.accessor("user.creditScore", {
        header: "信用分",
    }),
    columnHelper.accessor("createdAt", {
        header: "加入时间",
        cell: ({ getValue }) => date(getValue()),
    }),
    columnHelper.display({
        id: "action",
        header: "操作",
        meta: {
            width: 140,
        },
        cell: () => (
            <div className="flex items-center gap-3">
                <Button isIconOnly size="sm" variant="danger-soft">
                    <span className="icon-[ri--delete-bin-6-line]" />
                </Button>
            </div>
        ),
    }),
];

export const MemberTable = ({ items, total, page, sort, order, keyword }: TableProps) => {
    const [isPending, startTransition] = React.useTransition();

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <KeywordFilters startTransition={startTransition} keyword={keyword} />
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

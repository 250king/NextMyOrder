"use client";
import React from "react";
import { Avatar, cn, Table, TableContent } from "@heroui/react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { UserResponse, FindAll4Params } from "@/api/model";
import {Pagination} from "@/component/filter/pagination";
import {date} from "@/util/string";

type TableProps = FindAll4Params & {
    items: UserResponse[];
    total: number;
}

const columnHelper = createColumnHelper<UserResponse>()

const columns = [
    columnHelper.accessor('id', {
        header: "ID"
    }),
    columnHelper.accessor("name", {
        header: "用户名",
        cell: ({row}) => (
            <div className="flex items-center gap-3">
                <Avatar size="sm">
                    <Avatar.Image src={`https://q.qlogo.cn/g?b=qq&nk=${row.original.qq}&s=100`} />
                </Avatar>
                <div className="min-w-0">
                    <div className="truncate font-medium">{row.original.name}</div>
                    <div className="text-default-500 text-xs truncate">{row.original.qq}</div>
                </div>
            </div>
        )
    }),
    columnHelper.accessor("email", {
        header: "邮箱"
    }),
    columnHelper.accessor("creditScore", {
        header: "信用分"
    }),
    columnHelper.accessor("createdAt", {
        header: "注册时间",
        cell: ({getValue}) => date(getValue())
    }),
    columnHelper.accessor("updatedAt", {
        header: "更新时间",
        cell: ({getValue}) => date(getValue())
    })
]

const SortableColumnHeader = ({
    children,
    sortDirection,
}: {
    children: React.ReactNode;
    sortDirection?: "ascending" | "descending";
}) => {
    return (
        <span className="flex items-center justify-between">
            {children}
            {!!sortDirection && (
                <span
                    className={cn(
                        "size-3 transform transition-transform duration-100 ease-out icon-[gravity-ui--chevron-up]",
                        sortDirection === "descending" ? "rotate-180" : ""
                    )}
                />
            )}
        </span>
    );
}

export const UserTable = ({items, total, page}: TableProps) => {
    const table = useReactTable({
        columns,
        data: items,
        rowCount: total,
        initialState: {pagination: {pageSize: 10}},
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <Table>
            <Table.ScrollContainer>
                <TableContent>
                    <Table.Header>
                        {table.getHeaderGroups()[0]!.headers.map((header) => (
                            <Table.Column
                                key={header.id}
                                allowsSorting={header.column.getCanSort()}
                                id={header.id}
                                isRowHeader={header.id === "name"}
                            >
                                {({ sortDirection }) => (
                                    <SortableColumnHeader sortDirection={sortDirection}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </SortableColumnHeader>
                                )}
                            </Table.Column>
                        ))}
                    </Table.Header>
                    <Table.Body>
                        {table.getRowModel().rows.map((row) => (
                            <Table.Row key={row.id} id={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <Table.Cell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Table.Cell>
                                ))}
                            </Table.Row>
                        ))}
                    </Table.Body>
                </TableContent>
            </Table.ScrollContainer>
            <Table.Footer>
                <Pagination total={total} page={page} center={false} />
            </Table.Footer>
        </Table>
    );
};

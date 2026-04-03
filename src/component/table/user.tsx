"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Avatar, Table, TableContent } from "@heroui/react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { FindAll4Params, UserResponse } from "@/api/model";
import { KeywordFilters } from "@/component/filter/keyword";
import { Loading } from "@/component/filter/loading";
import { Pagination } from "@/component/filter/pagination";
import { SortableColumnHeader } from "@/component/table/common";
import { ColumnMeta } from "@/type/table";
import { date } from "@/util/string";
import { onSortChange, sortDescriptor } from "@/util/table";

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
];

export const UserTable = ({ items, total, page, sort, order, keyword }: TableProps) => {
    const [isPending, startTransition] = React.useTransition();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const table = useReactTable({
        columns,
        data: items,
        rowCount: total,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="relative flex flex-col gap-4">
            {isPending && <Loading />}
            <KeywordFilters startTransition={startTransition} keyword={keyword}/>
            <Table>
                <Table.ScrollContainer>
                    <TableContent
                        sortDescriptor={sortDescriptor(sort, order)}
                        onSortChange={(descriptor) =>
                            onSortChange(
                                descriptor,
                                startTransition,
                                searchParams,
                                router,
                                pathname,
                                sort,
                                order
                            )
                        }
                    >
                        <Table.Header>
                            {table.getHeaderGroups()[0]!.headers.map((header) => (
                                <Table.Column
                                    key={header.id}
                                    id={header.id}
                                    allowsSorting={header.column.getCanSort()}
                                    isRowHeader={header.id === "name"}
                                    style={{
                                        width:
                                            (header.column.columnDef.meta as ColumnMeta)?.width ??
                                            "auto",
                                    }}
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
                                        <Table.Cell
                                            key={cell.id}
                                            style={{
                                                width:
                                                    (cell.column.columnDef.meta as ColumnMeta)
                                                        ?.width ?? "auto",
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </Table.Cell>
                                    ))}
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </TableContent>
                </Table.ScrollContainer>
                <Table.Footer>
                    <Pagination
                        startTransition={startTransition}
                        total={total}
                        page={page}
                        center={false}
                    />
                </Table.Footer>
            </Table>
        </div>
    );
};

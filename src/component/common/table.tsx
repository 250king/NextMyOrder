import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn, Table, TableContent } from "@heroui/react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Pagination } from "@/component/common/pagination";
import { ColumnMeta } from "@/type/table";
import { onSortChange, sortDescriptor } from "@/util/table";

type TableProps<T> = {
    startTransition: React.TransitionStartFunction;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: ColumnDef<T, any>[];
    rowHeader?: string;
    items: T[];
    total: number;
    sort?: string;
    order?: string;
    page?: number;
};

export const SortableColumnHeader = ({ children, sortDirection }: { children: React.ReactNode; sortDirection?: "ascending" | "descending" }) => {
    return (
        <span className="flex items-center justify-between">
            {children}
            {!!sortDirection && (
                <span
                    className={cn(
                        "size-3 transform transition-transform duration-100 ease-out icon-[ri--arrow-up-s-line]",
                        sortDirection === "descending" ? "rotate-180" : ""
                    )}
                />
            )}
        </span>
    );
};

export const HeroTable = <T extends object>({ sort, columns, items, order, startTransition, total, page, rowHeader = "name" }: TableProps<T>) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        columns,
        data: items,
        rowCount: total,
        manualSorting: true,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Table>
            <Table.ScrollContainer>
                <TableContent
                    sortDescriptor={sortDescriptor(sort, order)}
                    onSortChange={(descriptor) => onSortChange(descriptor, startTransition, searchParams, router, pathname, sort, order)}
                >
                    <Table.Header>
                        {table.getHeaderGroups()[0]!.headers.map((header) => (
                            <Table.Column
                                key={header.id}
                                id={header.id}
                                allowsSorting={header.column.getCanSort()}
                                isRowHeader={header.id === rowHeader}
                                style={{
                                    width: (header.column.columnDef.meta as ColumnMeta)?.width ?? "auto",
                                }}
                            >
                                {({ sortDirection }) => (
                                    <SortableColumnHeader sortDirection={sortDirection}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
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
                                            width: (cell.column.columnDef.meta as ColumnMeta)?.width ?? "auto",
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Table.Cell>
                                ))}
                            </Table.Row>
                        ))}
                    </Table.Body>
                </TableContent>
            </Table.ScrollContainer>
            <Table.Footer>
                <Pagination startTransition={startTransition} total={total} page={page} center={false} />
            </Table.Footer>
        </Table>
    );
};

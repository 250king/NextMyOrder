import React from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { SortDescriptor } from "@heroui/react";

export const onSortChange = (
    descriptor: SortDescriptor,
    startTransition: React.TransitionStartFunction,
    searchParams: URLSearchParams,
    router: AppRouterInstance,
    pathname: string,
    sort?: string,
    order?: string,
) => {
    const nextColumn = String(descriptor.column);
    const nextOrder = descriptor.direction === "ascending" ? "asc" : "desc";
    const params = new URLSearchParams(searchParams.toString());
    const isSameColumn = sort === nextColumn;
    const wasDesc = order === "desc";
    const goesBackToAsc = nextOrder === "asc";
    if (isSameColumn && wasDesc && goesBackToAsc) {
        params.delete("sort");
        params.delete("order");
    } else {
        params.set("sort", nextColumn);
        params.set("order", nextOrder);
    }
    startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    })
};

export const sortDescriptor = (
    sort?: string,
    order?: string
): SortDescriptor | undefined => {
    if (!sort) {
        return undefined
    }
    return {
        column: sort,
        direction: order === "asc" ? "ascending" : "descending",
    };
};

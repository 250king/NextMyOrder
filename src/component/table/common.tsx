import React from "react";
import { cn } from "@heroui/react";

export const SortableColumnHeader = ({
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
};
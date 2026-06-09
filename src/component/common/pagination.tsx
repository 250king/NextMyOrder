"use client";
import React from "react";
import { Pagination as HeroPagination } from "@heroui/react";
import { useFilter } from "@/component/data/filter";

type PaginationProps = {
    startTransition: React.TransitionStartFunction;
    total: number;
    page?: number;
    size?: number;
    center?: boolean;
};

type PageItem = number | "ellipsis-left" | "ellipsis-right";

const buildPageItems = (pages: number, current: number): PageItem[] => {
    if (pages <= 3) {
        return Array.from({ length: pages }, (_, i) => i + 1);
    }
    if (current <= 2) {
        return [1, 2, 3, "ellipsis-right", pages];
    }
    if (current >= pages - 1) {
        return [1, "ellipsis-left", pages - 2, pages - 1, pages];
    }
    return [1, "ellipsis-left", current, "ellipsis-right", pages];
};

export const Pagination = ({ startTransition, total, page, size, center = true }: PaginationProps) => {
    const { updateFilter } = useFilter(startTransition);
    const safeSize = Number.isFinite(size) && (size ?? 0) > 0 ? (size as number) : 10;
    const pagesRaw = Math.ceil(Math.max(0, total) / safeSize);
    const pages = Math.max(1, Number.isFinite(pagesRaw) ? pagesRaw : 1);
    const pageRaw = typeof page === "number" ? page : Number(page);
    const current = Number.isFinite(pageRaw) ? Math.min(Math.max(1, pageRaw), pages) : 1;
    const pageItems = buildPageItems(pages, current);
    const start = total === 0 ? 0 : (current - 1) * safeSize + 1;
    const end = total === 0 ? 0 : Math.min(current * safeSize, total);

    const onChange = (nextPage: number) => {
        const clamped = Math.min(Math.max(1, nextPage), pages);
        if (clamped === current) {
            return;
        }
        updateFilter({
            page: String(clamped),
            size: safeSize === 10 ? null : String(safeSize),
        });
    };

    return (
        <HeroPagination className={`mx-auto w-full flex-row ${center ? "justify-center" : ""}`}>
            {!center && (
                <HeroPagination.Summary>
                    第 {start}-{end} 条/总共 {total} 条
                </HeroPagination.Summary>
            )}
            <HeroPagination.Content>
                <HeroPagination.Item>
                    <HeroPagination.Previous isDisabled={current <= 1} onPress={() => onChange(current - 1)}>
                        <HeroPagination.PreviousIcon />
                    </HeroPagination.Previous>
                </HeroPagination.Item>
                {pageItems.map((item, index) => (
                    <HeroPagination.Item key={`${item}-${index}`}>
                        {typeof item === "number" ? (
                            <HeroPagination.Link isActive={item === current} onPress={() => onChange(item)}>
                                {item}
                            </HeroPagination.Link>
                        ) : (
                            <HeroPagination.Ellipsis />
                        )}
                    </HeroPagination.Item>
                ))}
                <HeroPagination.Item>
                    <HeroPagination.Next isDisabled={current >= pages} onPress={() => onChange(current + 1)}>
                        <HeroPagination.NextIcon />
                    </HeroPagination.Next>
                </HeroPagination.Item>
            </HeroPagination.Content>
        </HeroPagination>
    );
};

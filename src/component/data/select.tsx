"use client";

import React from "react";
import { Checkbox, Label } from "@heroui/react";
import { useFilter } from "@/component/data/filter";

type SelectAllProps<T> = {
    items: T[];
    getKey?: (item: T) => string | number;
    label?: React.ReactNode;
    isDisabled?: boolean;
};

export const SelectAll = <T,>({
    items,
    getKey = (item) => (item as { id: string | number }).id,
    label = "全选",
    isDisabled = false,
}: SelectAllProps<T>) => {
    const [, startTransition] = React.useTransition();
    const { searchParams, updateLocalFilter } = useFilter(startTransition);

    const selected = React.useMemo(() => {
        try {
            const current = searchParams.get("selected");
            return current ? (JSON.parse(current) as string[]) : [];
        } catch {
            return [];
        }
    }, [searchParams]);

    const currentIds = React.useMemo(() => items.map((item) => String(getKey(item))), [items, getKey]);

    const currentIdSet = React.useMemo(() => new Set(currentIds), [currentIds]);

    const selectedSet = React.useMemo(() => new Set(selected), [selected]);

    const selectedCountOnPage = React.useMemo(
        () => currentIds.filter((id) => selectedSet.has(id)).length,
        [currentIds, selectedSet]
    );

    const isSelected = currentIds.length > 0 && selectedCountOnPage === currentIds.length;

    const isIndeterminate = selectedCountOnPage > 0 && selectedCountOnPage < currentIds.length;

    const handleChange = (checked: boolean) => {
        if (checked) {
            const next = Array.from(new Set([...selected, ...currentIds]));
            updateLocalFilter({
                selected: next.length ? JSON.stringify(next) : null,
            });
            return;
        }

        const next = selected.filter((id) => !currentIdSet.has(id));
        updateLocalFilter({
            selected: next.length ? JSON.stringify(next) : null,
        });
    };

    return (
        <Checkbox
            isSelected={isSelected}
            isIndeterminate={isIndeterminate}
            isDisabled={isDisabled || currentIds.length === 0}
            onChange={handleChange}
        >
            <Checkbox.Control>
                <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content>
                <Label>{label}</Label>
            </Checkbox.Content>
        </Checkbox>
    );
};

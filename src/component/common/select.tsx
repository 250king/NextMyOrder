"use client";

import React from "react";
import { Button, Checkbox, Label } from "@heroui/react";
import { useFilter } from "@/component/common/filter";
import { useSelected } from "@/util/hook";

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
    const { updateLocalFilter } = useFilter(startTransition);
    const selected = useSelected();
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
        <div className="flex flex-row gap-2 items-center">
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
            {selected.length > 0 && (
                <>
                    <div className="text-muted text-xs">已选{selected.length}项</div>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                            updateLocalFilter({
                                selected: null,
                            });
                        }}
                    >
                        <span className="icon-[ri--close-fill]" />
                    </Button>
                </>
            )}
        </div>
    );
};

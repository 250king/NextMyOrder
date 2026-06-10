"use client";
import React from "react";
import { CheckboxGroup } from "@heroui/react";
import { useFilter } from "@/component/common/filter";
import { useSelected } from "@/util/hook";

export const OrderCard = () => {
    const [isPending, startTransition] = React.useTransition();
    const { updateFilter, updateLocalFilter } = useFilter(startTransition);
    const selected = useSelected();

    return (
        <CheckboxGroup
            value={selected}
            onChange={(val) => updateLocalFilter({ selected: val.length > 0 ? JSON.stringify(val) : null })}
        ></CheckboxGroup>
    );
};

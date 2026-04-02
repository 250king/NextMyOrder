"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Label, Tag, TagGroup } from "@heroui/react";
import type { Selection } from "@react-types/shared";
import { FindAll1Params, PaymentResponseMethod, PaymentResponseType } from "@/api/model";
import { FiltersProps } from "@/type/filter";
import { methodMap, typeMap } from "@/type/payment";

export const PaymentFilters = ({ type, method, startTransition }: FiltersProps<FindAll1Params>) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateFilter = (name: string, keys: Selection) => {
        const value = Array.from(keys)[0];
        const params = new URLSearchParams(searchParams.toString());
        if (!value || value === "ALL") {
            params.delete(name);
        } else {
            params.set(name, value.toString());
        }
        params.delete("page");
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <TagGroup
                selectedKeys={[type || "ALL"]}
                selectionMode="single"
                onSelectionChange={(keys) => updateFilter("type", keys)}
            >
                <Label>收款项</Label>
                <TagGroup.List>
                    <Tag id="ALL">全部</Tag>
                    {Object.keys(typeMap).map((key) => (
                        <Tag key={key} id={key}>
                            {typeMap[key as PaymentResponseType]}
                        </Tag>
                    ))}
                </TagGroup.List>
            </TagGroup>
            <TagGroup
                selectedKeys={[method || "ALL"]}
                selectionMode="single"
                onSelectionChange={(keys) => updateFilter("method", keys)}
            >
                <Label>支付方式</Label>
                <TagGroup.List>
                    <Tag id="ALL">全部</Tag>
                    {Object.keys(methodMap).map((key) => (
                        <Tag key={key} id={key}>
                            {methodMap[key as PaymentResponseMethod]}
                        </Tag>
                    ))}
                </TagGroup.List>
            </TagGroup>
        </div>
    );
};

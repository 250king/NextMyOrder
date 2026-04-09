import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Label, Tag, TagGroup, TextField } from "@heroui/react";

interface SearchFilterProps {
    label?: string;
    placeholder?: string;
    initialValue?: string;
    onSearch: (value: string) => void;
}

interface EnumFilterProps {
    label: string;
    currentValue?: string;
    options: Record<string, string>;
    onChange: (value: string) => void;
}

export const useFilter = (startTransition: React.TransitionStartFunction) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const updateFilter = React.useCallback(
        (updates: Record<string, string | null | undefined>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([name, value]) => {
                if (!value || value === "ALL") {
                    params.delete(name);
                } else {
                    params.set(name, value);
                }
            });
            if (!("page" in updates)) {
                params.delete("page");
            }
            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
            });
        },
        [pathname, router, searchParams, startTransition]
    );
    return { updateFilter, searchParams };
};

export const SearchFilter = ({ label = "搜索", placeholder, initialValue = "", onSearch }: SearchFilterProps) => {
    const [val, setVal] = React.useState(initialValue);

    React.useEffect(() => {
        setVal(initialValue);
    }, [initialValue]);
    React.useEffect(() => {
        if (val.trim() === (initialValue || "")) return;

        const timer = setTimeout(() => {
            onSearch(val.trim());
        }, 800);
        return () => clearTimeout(timer);
    }, [onSearch, val, initialValue]);

    return (
        <TextField className="w-full max-w-64" onChange={setVal}>
            <Label>{label}</Label>
            <Input value={val} placeholder={placeholder} type="search" />
        </TextField>
    );
};

export const EnumFilter = ({ label, currentValue, options, onChange }: EnumFilterProps) => {
    return (
        <TagGroup
            selectedKeys={[currentValue || "ALL"]}
            selectionMode="single"
            onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                if (!selected) {
                    return;
                }
                onChange(selected);
            }}
        >
            <Label>{label}</Label>
            <TagGroup.List>
                <Tag id="ALL">全部</Tag>
                {Object.entries(options).map(([key, text]) => (
                    <Tag key={key} id={key}>
                        {text}
                    </Tag>
                ))}
            </TagGroup.List>
        </TagGroup>
    );
};

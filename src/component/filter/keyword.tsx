import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Label, TextField } from "@heroui/react";
import { FindAll4Params } from "@/api/model";
import { FiltersProps } from "@/type/filter";

export const KeywordFilters = ({keyword, startTransition}: FiltersProps<FindAll4Params>) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [value, setValue] = React.useState(keyword || "");
    
    React.useEffect(() => {
        setValue(keyword || "");
    }, [keyword])
    React.useEffect(() => {
        const timer = setTimeout(() => {
            const nextValue = value.trim();
            const currentValue = (searchParams.get("keyword") ?? "").trim();
            if (nextValue === currentValue) {
                return;
            }
            const params = new URLSearchParams(searchParams.toString());
            if (nextValue) {
                params.set("keyword", nextValue);
            } else {
                params.delete("keyword");
            }
            params.delete("page");
            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
            });
        }, 1000);
        return () => clearTimeout(timer);
    }, [value, pathname, router, searchParams, startTransition]);

    return (
        <div className="flex flex-col gap-6">
            <TextField className="w-full max-w-64" onChange={setValue}>
                <Label>搜索</Label>
                <Input value={value} />
            </TextField>
        </div>
    );
}

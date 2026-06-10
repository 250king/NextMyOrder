import React from "react";
import { useSearchParams } from "next/navigation";

export const useSelected = () => {
    const searchParams = useSearchParams();
    return React.useMemo(() => {
        try {
            const current = searchParams.get("selected");
            return current ? (JSON.parse(current) as string[]) : [];
        } catch {
            return [];
        }
    }, [searchParams]);
};
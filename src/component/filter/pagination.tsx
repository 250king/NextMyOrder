"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination as HeroPagination } from '@heroui/react';

type PaginationProps = {
    total: number;
    page?: number;
    size?: number;
};

export const Pagination = ({ total, page, size = 10 }: PaginationProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const pages = Math.ceil(total / size);
    const current = page ? page : 1;

    const onChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page === 1) {
            params.delete("page");
        } else {
            params.set("page", page.toString());
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }

    return total === 0 ? null : (
        <HeroPagination className="justify-center mx-auto w-full flex-row">
            <HeroPagination.Content>
                <HeroPagination.Item>
                    <HeroPagination.Previous
                        isDisabled={current === 1}
                        onPress={() => onChange(current - 1)}
                    >
                        <HeroPagination.PreviousIcon />
                    </HeroPagination.Previous>
                </HeroPagination.Item>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <HeroPagination.Item key={p}>
                        <HeroPagination.Link isActive={p === current} onPress={() => onChange(p)}>
                            {p}
                        </HeroPagination.Link>
                    </HeroPagination.Item>
                ))}
                <HeroPagination.Item>
                    <HeroPagination.Next
                        isDisabled={current === pages}
                        onPress={() => onChange(current + 1)}
                    >
                        <HeroPagination.NextIcon />
                    </HeroPagination.Next>
                </HeroPagination.Item>
            </HeroPagination.Content>
        </HeroPagination>
    );
};

import { Pagination as HeroPagination } from '@heroui/react';

type PaginationProps = {
    total: number;
    size: number;
    page: number;
    onChange: (page: number) => void;
}

export const Pagination = ({total, size, page, onChange}: PaginationProps) => {
    const pages = Math.ceil(total / size);

    return total === 0 ? null : (
        <HeroPagination className="justify-center mx-auto w-full flex-row">
            <HeroPagination.Content>
                <HeroPagination.Item>
                    <HeroPagination.Previous isDisabled={page === 1} onPress={() => onChange(page - 1)}>
                        <HeroPagination.PreviousIcon />
                    </HeroPagination.Previous>
                </HeroPagination.Item>
                {Array.from({ length: page }, (_, i) => i + 1).map((p) => (
                    <HeroPagination.Item key={p}>
                        <HeroPagination.Link isActive={p === pages} onPress={() => onChange(p)}>
                            {p}
                        </HeroPagination.Link>
                    </HeroPagination.Item>
                ))}
                <HeroPagination.Item>
                    <HeroPagination.Next isDisabled={page === pages} onPress={() => onChange(page + 1)}>
                        <HeroPagination.NextIcon />
                    </HeroPagination.Next>
                </HeroPagination.Item>
            </HeroPagination.Content>
        </HeroPagination>
    );
}

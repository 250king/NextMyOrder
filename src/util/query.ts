import { Query } from "@/type/common";

const toPositiveInt = (value: unknown, fallback: number) => {
    const num = Number(value);
    return Number.isInteger(num) && num > 0 ? num : fallback;
};

export const getPagination = <T>(query: Query<T>, defaultSize = 10, maxSize = 100) => {
    const page = toPositiveInt(query.page, 1);
    const rawSize = toPositiveInt(query.size, defaultSize);
    const size = Math.min(rawSize, maxSize);

    return {
        limit: size,
        offset: (page - 1) * size,
    };
};

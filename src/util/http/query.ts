import {ParamsType} from "@ant-design/pro-provider";
import {SortOrder} from "antd/es/table/interface";

type Input = Record<string, unknown>;

interface ParamsProps extends ParamsType {
    pageSize?: number
    current?: number
    keyword?: string
}

const index= ["id", "userId", "groupId", "itemId"]
const bool = ["allowed"]
const blocked = ["address", "phone", "keyword"]

const stringToRecord = (key: string, value: Input) => {
    const keys = key?.split(".");
    return keys?.reverse().reduce<string | Record<string, unknown>>((acc, key) => ({[key]: acc}), value);
}

const searchBuilder = (keyword: string, fields: string[]) => {
    const result = []
    const condition = {
        contains: keyword,
        mode: "insensitive"
    }
    for (const field of fields) {
        if (index.includes(field) || bool.includes(field)) continue;
        result.push(stringToRecord(field, condition));
    }
    return result
}

export const queryParser = (
    params: URLSearchParams,
    fields: string[],
    where: Input = {}
) => {
    let filter;
    if (params.get("keyword")) {
        filter = searchBuilder(params.get("keyword") || "", fields);
    }
    else {
        filter = JSON.parse(params.get("filter") || "{}");
    }
    const page = JSON.parse(params.get("page") || '{"current": 1, "pageSize": 20}');
    const sort = JSON.parse(params.get("sort") || '{"id": "asc"}');
    const filtered: Input = {}
    if (params.get("keyword")) {
        filtered.OR = filter;
    }
    else {
        for (const key in filter) {
            if (blocked.includes(key)) continue;
            filtered[key] = index.includes(key)? Number(filter[key]): bool.includes(key)? filter[key] === "true": filter[key];
        }
    }
    for (const key in where) {
        filtered[key] = where[key];
    }
    return {
        where: filtered,
        orderBy: stringToRecord(sort.field, sort.order) as Record<string, unknown>,
        skip: (page.current - 1) * page.pageSize,
        take: page.pageSize
    }
}

export const queryBuilder = (
    params: ParamsProps,
    sort: Record<string, SortOrder>
) => {
    const page: Record<string, unknown> = {};
    const system = ["pageSize", "current"];
    const filter: Record<string, unknown> = {};
    for (const key in params) {
        if (system.includes(key)) {
            page[key] = params[key];
        }
        else {
            filter[key] = params[key];
        }
    }
    if (params.keyword) {
        return new URLSearchParams({
            keyword: params.keyword,
            page: JSON.stringify(page),
            sort: JSON.stringify({
                field: Object.keys(sort)[0]?.replace(",", ".") || "id",
                order: Object.values(sort)[0] === "descend"? "desc": "asc"
            })
        });
    }
    return new URLSearchParams({
        filter: JSON.stringify(filter),
        page: JSON.stringify(page),
        sort: JSON.stringify({
            field: Object.keys(sort)[0]?.replace(",", ".") || "id",
            order: Object.values(sort)[0] === "descend"? "desc": "asc"
        })
    })
}

import {number, object, string, enum as zEnum, infer as zInfer} from "zod";
import {any} from "zod";
import {record} from "zod";

type Input = Record<string, unknown>;

const int = ["id", "userId", "groupId", "itemId", "deliveryId"]
const blocked = ["address", "phone", "keyword"]
const bool = ["allowed"]

const stringToRecord = (key: string, value: Input) => {
    const keys = key?.split(".");
    return keys?.reverse().reduce<string | Record<string, unknown>>((acc, key) => ({[key]: acc}), value);
}

export const queryParams = object({
    params: object({
        pageSize: number().default(20),
        current: number().default(1),
        keyword: string().optional(),
    }).catchall(any()).transform((params) => {
        for (const i in params) {
            if (params[i] == null) {
            } else if (int.includes(i)) {
                params[i] = Number(params[i]);
            } else if (bool.includes(i)) {
                params[i] = (params[i] === "true");
            }
        }
        return params;
    }),
    sort: record(zEnum(["ascend", "descend"]).nullable()).transform((sort) => {
        const field = Object.keys(sort)[0];
        const order = sort[field];
        if (!field || !order) {
            return {id: "asc"};
        }
        return {[field.replace(/,/g, '.')]: order === 'descend' ? 'desc' : 'asc'};
    }).default({"id": "ascend"})
})

const searchBuilder = (keyword: string, fields: string[]) => {
    const result = []
    const condition = {
        contains: keyword,
        mode: "insensitive"
    }
    for (const field of fields) {
        if (int.includes(field) || bool.includes(field)) continue;
        result.push(stringToRecord(field, condition));
    }
    return result
}

export const queryParser = (
    query: zInfer<typeof queryParams>,
    fields: string[],
    where: Input = {}
) => {
    const {pageSize, current, keyword, ...filter} = query.params;
    const builder: Input = {};
    if (keyword) {
        builder.OR = searchBuilder(keyword || "", fields);
    }
    const filters = Object.fromEntries(Object.entries(filter).filter(([key]) => !blocked.includes(key)))
    for (const key in filters) {
        builder[key] = filters[key];
    }
    for (const key in where) {
        builder[key] = where[key];
    }
    return {
        where: builder,
        orderBy: stringToRecord(Object.keys(query.sort)[0], <Input><unknown>Object.values(query.sort)[0]) as Record<string, unknown>,
        skip: (current - 1) * pageSize,
        take: pageSize
    }
}

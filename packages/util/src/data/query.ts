import {z} from "zod/v4";
import {TRPCError} from "@trpc/server";
import {Prisma} from "@prisma/client";

type SearchBuilder = {
    [key: string]: {
        contains: string,
        mode: "insensitive",
    },
}[]

const expandNestedField = (field: string, value: any) => {
    const keys = field.split(".");
    return keys.reduceRight((acc, key) => ({ [key]: acc }), value);
};

const deepMerge = (target: any, source: any): any => {
    for (const key of Object.keys(source)) {
        if (
            key in target &&
            typeof target[key] === "object" &&
            typeof source[key] === "object"
        ) {
            target[key] = deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
};

const buildTree = (paths: string[]): Record<string, any> => {
    const result = new Set<string>();
    for (const path of paths) {
        const parts = path.split(".");
        for (let i = 1; i <= parts.length; i++) {
            result.add(parts.slice(0, i).join("."));
        }
    }
    return Array.from(result).reduce((acc, path) => {
        return deepMerge(acc, expandNestedField(path, {}));
    }, {});
};

export const safeSelect = (
    name: string,
    block: string[] = [],
    include: string[] = [],
) => {
    const model = Prisma.dmmf.datamodel.models.find(
        (m) => m.name.toLowerCase() === name.toLowerCase(),
    );
    if (!model) {
        throw new Error(`Model ${name} not found`);
    }

    const blockTree = buildTree(block);
    const includeTree = buildTree(include);

    const buildSelect = (
        modelName: string,
        blockNode: Record<string, any>,
        includeNode: Record<string, any>,
    ): Record<string, any> => {
        const mdl = Prisma.dmmf.datamodel.models.find(
            (m) => m.name.toLowerCase() === modelName.toLowerCase(),
        );
        if (!mdl) return {};

        return Object.fromEntries(
            mdl.fields
                .filter((f) =>
                    f.kind === "object"
                        ? f.name in includeNode
                        : !(f.name in blockNode),
                )
                .map((f) => {
                    if (f.kind === "object") {
                        return [
                            f.name,
                            {
                                select: buildSelect(
                                    f.type,
                                    blockNode[f.name] || {},
                                    includeNode[f.name] || {},
                                ),
                            },
                        ];
                    }
                    return [f.name, true];
                }),
        );
    };

    return {
        select: buildSelect(name, blockTree, includeTree),
    };
};

export const safeRule = z.object({
    filter: z.object({
        field: z.string(),
        operator: z.enum(["eq", "ne", "gt", "gte", "lt", "lte", "contains", "startsWith", "endsWith"]).array(),
    }).array(),
    column: z.object({
        modal: z.string(),
        block: z.string().array().optional(),
        include: z.string().array().optional(),
    }).optional(),
    sort: z.string().array().default(["id"]).optional(),
    search: z.string().array().default(["name"]).optional(),
});

const filter = z.object({
    field: z.string(),
    operator: z.enum(["eq", "ne", "gt", "gte", "lt", "lte", "contains", "startsWith", "endsWith"]),
    value: z.union([z.string(), z.number(), z.boolean(), z.date()]).nullable(),
}).array().optional();

export const queryDsl = z.object({
    filter: filter,
    sort: z.object({
        field: z.string().default("id"),
        order: z.enum(["asc", "desc"]).default("asc"),
    }).optional(),
    page: z.object({
        size: z.number().default(20),
        current: z.number().default(1),
    }).optional(),
    search: z.string().optional(),
});

export const whereBuilder = (
    query: z.infer<typeof queryDsl>,
    rule: SafeRule,
    isCount: boolean = false,
) => {
    query.filter?.forEach(i => {
        if (!rule.filter.some(r => r.field === i.field && r.operator.includes(i.operator))) {
            throw new TRPCError({code: "BAD_REQUEST", message: `Invalid filter: ${i.field} ${i.operator}`});
        }
    });
    if (query.sort?.field && !rule.sort?.includes(query.sort?.field)) {
        throw new TRPCError({code: "BAD_REQUEST", message: `Invalid sort field: ${query.sort.field}`});
    }
    const searchBuilder: SearchBuilder = [];
    const skip = ((query.page?.current || 1) - 1) * (query.page?.size || 20);
    const take = query.page?.size || 20;
    if (query.search) {
        rule.search?.forEach(i => {
            return searchBuilder.push(expandNestedField(i, {
                contains: query.search!,
                mode: "insensitive",
            }));
        });
    }
    return {
        orderBy: query.sort? expandNestedField(query.sort.field, query.sort.order): {},
        where: {
            ...(query.filter? {
                AND: query.filter.map(i => {
                    switch (i.operator) {
                        case "eq":
                            return expandNestedField(i.field, i.value);
                        case "ne":
                            return expandNestedField(i.field, {not: i.value});
                        case "gt":
                            return expandNestedField(i.field, {gt: i.value});
                        case "gte":
                            return expandNestedField(i.field, {gte: i.value});
                        case "lt":
                            return expandNestedField(i.field, {lt: i.value});
                        case "lte":
                            return expandNestedField(i.field, {lte: i.value});
                        case "contains":
                            return expandNestedField(i.field, {contains: i.value});
                        case "startsWith":
                            return expandNestedField(i.field, {startsWith: i.value});
                        case "endsWith":
                            return expandNestedField(i.field, {endsWith: i.value});
                    }
                }),
            }: {}),
            ...(searchBuilder.length > 0 ? {OR: searchBuilder} : {}),
        },
        ...(rule.column && !isCount? safeSelect(rule.column!.modal, rule.column?.block, rule.column?.include): {}),
        ...(isCount? {}: {skip, take}),
    };
};

export type SafeRule = z.infer<typeof safeRule>;

export type Filter = z.infer<typeof filter>;

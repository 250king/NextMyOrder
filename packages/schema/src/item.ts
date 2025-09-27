import nullable from "@repo/util/data/type";
import {z} from "zod/v4";

export const statusMap = {
    true: {
        text: "已通过",
    },
    false: {
        text: "未通过",
    },
};

export const itemSchema = z.object({
    id: z.number(),
    groupId: z.number(),
    name: z.string(),
    url: z.url(),
    image: nullable(z.url()),
    price: z.number(),
    weight: z.number().nullish().catch(null),
});

export const itemData = itemSchema.extend({
    ids: z.number().array(),
    urls: z.url().array(),
    items: z.object({
        id: z.number(),
        count: z.number(),
    }).array(),
});

export type ItemSchema = z.infer<typeof itemSchema>

export type ItemData = z.infer<typeof itemData>;

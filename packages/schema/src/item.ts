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
    image: z.url().nullish().catch(null),
    price: z.number(),
    weight: z.number().nullish().catch(null),
});

export const itemData = itemSchema;

export type ItemSchema = z.infer<typeof itemSchema>

export type ItemData = z.infer<typeof itemData>;

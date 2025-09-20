import {z} from "zod/v4";

export const statusMap = {
    true: {
        text: "已结束",
    },
    false: {
        text: "进行中",
    },
};

export const confirmMap = {
    true: {
        text: "已确认",
    },
    false: {
        text: "未确认",
    },
};

export const groupSchema = z.object({
    id: z.number(),
    name: z.string(),
    qq: z.string().regex(/^\d+$/),
    deadline: z.date().default(new Date()),
    ended: z.boolean().default(false),
    createdAt: z.date().default(new Date()),
});

export const groupData = groupSchema.omit({
    ended: true,
    createdAt: true,
    deadline: true,
}).extend({
    deadline: z.iso.datetime().default(new Date().toISOString()),
});

export type GroupSchema = z.infer<typeof groupSchema>;

export type GroupData = z.infer<typeof groupData>;

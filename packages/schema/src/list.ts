import {z} from "zod/v4";
import {userSchema} from "./user";
import {groupSchema} from "./group";

export const confirmMap = {
    true: {
        text: "已确认",
    },
    false: {
        text: "未确认",
    },
};

export const finishedMap = {
    true: {
        text: "已完成",
    },
    false: {
        text: "未完成",
    },
};

export const listSchema = z.object({
    id: z.number(),
    userId: z.number(),
    groupId: z.number(),
    createdAt: z.date().default(new Date()),
    confirmed: z.boolean().default(false),
    finished: z.boolean().default(false),
    user: userSchema,
    group: groupSchema,
});

export const listData = listSchema.pick({
    id: true,
    userId: true,
    groupId: true,
}).extend({
    userIds: z.number().array(),
});

export type ListSchema = z.infer<typeof listSchema>;

export type ListData = z.infer<typeof listData>;

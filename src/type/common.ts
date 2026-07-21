import { z } from "zod";
import { userSchema } from "@/type/user";

export type Context = {
    refreshToken: string | null;
    isAdmin: boolean;
    uid: number | null;
    user: z.infer<typeof userSchema> | null;
};

export type Query<T = void> = ([T] extends [void] ? object : T) & {
    order?: string;
    sort?: string;
    page?: number;
    size?: number;
    keyword?: string;
    id?: number;
};

export type PanelProps<T> = {
    data: T;
    userId: number
}

export type ModalState<T = void> = ([T] extends [void] ? object : { data: T }) & {
    open: boolean;
    onChange: (value: boolean) => void;
};

export type DataCardProps<T, R> = T & {
    items: R[],
    total: number,
}

export const query = z.object({
    order: z.enum(["asc", "desc"]).default("asc"),
    sort: z.string().default("id"),
    page: z.int().positive().default(1),
    size: z.int().positive().max(100).default(10),
    keyword: z.string().optional(),
    id: z.number().int().positive().optional(),
})

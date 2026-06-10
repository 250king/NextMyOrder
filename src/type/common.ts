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
    isAdmin: boolean;
}

export type ModalState<T = void> = ([T] extends [void] ? object : { data: T }) & {
    open: boolean;
    onChange: (value: boolean) => void;
};

export type DataCardProps<T, R> = T & {
    items: R[],
    total: number,
    isAdmin: boolean
}

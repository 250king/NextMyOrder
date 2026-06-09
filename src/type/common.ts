import { z } from "zod";
import { userSchema } from "@/type/user";

export type Context = {
    refreshToken: string | null;
    isAdmin: boolean;
    uid: number | null;
    user: z.infer<typeof userSchema> | null;
};

export type Query<T> = T & {
    order?: string;
    sort?: string;
    page?: number;
    size?: number;
    keyword?: string;
    id?: number;
};

export type ModalState<T = void> = {
    open: boolean;
    onChange: (value: boolean) => void;
} & ([T] extends [void] ? object : { data: T });

import type { UserInfo } from '@/type/user';

export type Context = {
    accessToken: string | null;
    isAdmin: boolean;
    uid: number | null;
    user: UserInfo | null;
};

export type Query<T> = T & {
    page?: number;
    size?: number;
    keyword?: string;
    id?: number;
};

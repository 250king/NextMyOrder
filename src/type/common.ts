import type { UserInfo } from '@/type/user';

export type Context = {
    accessToken: string;
    isAdmin: boolean;
    uid: number;
    user: UserInfo;
};

export type Query<T> = T & {
    page?: number;
    size?: number;
    keyword?: string;
    id?: number;
};

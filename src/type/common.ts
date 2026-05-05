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
};

export type Result<T> = {
    items: T[];
    total: number;
}

import type { UserInfo } from '@/type/user';

export type Context = {
    accessToken?: string;
    refreshToken?: string;
    isAdmin: boolean;
    user: UserInfo;
}
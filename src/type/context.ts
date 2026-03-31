import type { UserInfo } from '@/type/user';

export type Context = {
    accessToken: string | null;
    isAdmin: boolean;
    user: UserInfo;
}
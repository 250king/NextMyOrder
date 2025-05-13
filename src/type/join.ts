import {Join, User} from "@prisma/client";

export interface JoinDetail extends Join {
    user: User;
}

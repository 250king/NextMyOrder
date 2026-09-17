import { headers } from "next/headers";
import { Context } from "@/type/common";
import { userSchema } from "@/type/user";
import { toUtf8 } from "@/util/cover";

export const getContext = async (): Promise<Context> => {
    const header = await headers();
    const data = header.get("x-user");
    if (!data) {
        return {
            refreshToken: null,
            uid: null,
            user: null,
        };
    }
    const user = userSchema.parse(JSON.parse(toUtf8(data)));
    return {
        refreshToken: header.get("x-refresh-token")!,
        uid: Number(header.get("x-uid")),
        user,
    };
};

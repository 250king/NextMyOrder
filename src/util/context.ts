import { headers } from "next/headers"
import { Context } from "@/type/common";
import { UserInfo } from "@/type/user";
import { toUtf8 } from "@/util/string";

export const getContext = async (): Promise<Context> => {
    const header = await headers()
    if (!header.has("x-access-token") || !header.has("x-user")) {
        return {
            accessToken: null,
            isAdmin: false,
            uid: null,
            user: null
        };
    }
    const user = JSON.parse(toUtf8(header.get("x-user") || "")) as UserInfo;
    const payload = JSON.parse(toUtf8(header.get("x-access-token")?.split(".")[1] || ""));
    return {
        accessToken: header.get("x-access-token"),
        isAdmin: payload.scope.includes("admin:all"),
        uid: Number(header.get("x-uid")),
        user,
    };
}

import { headers } from "next/headers"
import { Context } from "@/type/common";
import { userSchema } from "@/type/user";
import { toUtf8 } from "@/util/cover";

export const getContext = async (): Promise<Context> => {
    const header = await headers()
    const data = header.get("x-user")
    if (!data) {
        return {
            accessToken: null,
            refreshToken: null,
            isAdmin: false,
            uid: null,
            user: null
        }
    }
    const user = userSchema.parse(JSON.parse(toUtf8(data)));
    const payload = JSON.parse(toUtf8(header.get("x-access-token")?.split(".")[1] || ""));
    return {
        accessToken: header.get("x-access-token")!,
        refreshToken: header.get("x-refresh-token")!,
        isAdmin: payload.scope.includes("admin:all"),
        uid: Number(header.get("x-uid")),
        user,
    };
}

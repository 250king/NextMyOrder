import { headers } from "next/headers"
import { AxiosRequestConfig } from "axios";
import { Context } from "@/type/context";
import { UserInfo } from "@/type/user";
import { toUtf8 } from "@/util/string";

export const getContext = async (): Promise<Context> => {
    const header = await headers()
    const user = JSON.parse(toUtf8(header.get("x-user") || "")) as UserInfo;
    const payload = JSON.parse(toUtf8(header.get("x-access-token")?.split(".")[1] || ""));
    return {
        accessToken: header.get("x-access-token"),
        isAdmin: payload.scope.includes("admin:all"),
        user,
    };
}

export const getConfig = (context: Context): AxiosRequestConfig => {
    return {
        headers: {
            Authorization: `Bearer ${context.accessToken}`
        }
    }
}

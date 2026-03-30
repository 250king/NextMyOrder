import { NextRequest, NextResponse } from "next/server";
import * as client from 'openid-client';
import { env } from "@/util/env";
import { issuer } from "@/util/oauth2";
import { get, has, setAll } from "@/util/session";

const buildUrl = (path: string, base: string) => {
    if (path == "/") {
        return new URL("/login", base)
    } else {
        return new URL(`/login?next=${encodeURIComponent(path)}`, base);
    }
}

export const proxy = async (request: NextRequest) => {
    const {pathname, search} = request.nextUrl;
    const sid = request.cookies.get(env.SESSION_COOKIE)?.value || crypto.randomUUID();
    const params = new Headers(request.headers);
    let response: NextResponse | null = null
    params.set("x-sid", sid);
    if (!["/login", "/logout", "/callback"].some(path => pathname == path)) {
        if (await has("expired_at") && await get("expired_at") < new Date().getTime()) {
            try {
                const res = await client.refreshTokenGrant(issuer, await get("refresh_token"), {
                    resource: env.RESOURCE_URI,
                })
                await setAll({
                    access_token: res.access_token,
                    refresh_token: res.refresh_token || null,
                    id_token: res.id_token || null,
                    expired_at: (res.expires_in || 0) * 1000 + new Date().getTime()
                })
                params.set("x-access-token", res.access_token);
                params.set("x-user", atob(res.id_token?.split(".")[1] || ""));
            } catch {
                response = NextResponse.redirect(buildUrl(`${pathname}${search}`, request.url));
            }
        } else if (await has("access_token")) {
            params.set("x-access-token", await get("access_token"));
            params.set("x-user", atob((await get("id_token")).split(".")[1]));
        } else {
            response = NextResponse.redirect(buildUrl(`${pathname}${search}`, request.url));
        }
    }
    if (response == null) {
        response = NextResponse.next({
            request: {
                headers: params,
            },
        });
    }
    response.cookies.set({
        name: env.SESSION_COOKIE,
        value: sid,
        secure: process.env.NODE_ENV === "production",
        maxAge: env.SESSION_TTL,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
    });
    return response;
};

export const config = {
    matcher: ["/((?!_next/static|_next/image|.well-known|favicon.ico|sitemap.xml|robots.txt).*)"],
};

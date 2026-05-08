import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import * as client from 'openid-client';
import { db } from "@/service/db";
import { user } from "@/service/db/schema";
import { UserInfo } from "@/type/user";
import { env } from "@/util/env";
import { getIssuer } from "@/util/oauth2";
import { getAll, setAll } from "@/util/session";
import { toUtf8 } from "@/util/string";

const buildUrl = (path: string, base: string) => {
    if (path == "/") {
        return new URL("/login", base)
    } else {
        return new URL(`/login?next=${encodeURIComponent(path)}`, base);
    }
}

const getUid = async (idToken: string) => {
    const ac = JSON.parse(toUtf8(idToken.split(".")[1])) as UserInfo;
    const result = await db.query.user.findFirst({ where: eq(user.qq, ac.custom_data.qq) });
    return result?.id;
}

export const proxy = async (request: NextRequest) => {
    const {pathname, search} = request.nextUrl;
    const sid = request.cookies.get(env.SESSION_COOKIE)?.value || crypto.randomUUID();
    const params = new Headers(request.headers);
    const session = await getAll(sid);
    let response: NextResponse | null = null
    params.set("x-sid", sid);
    if (!["/login", "/callback"].some(path => pathname == path)) {
        if ("expired_at" in session && session.expired_at < new Date().getTime()) {
            try {
                const res = await client.refreshTokenGrant(await getIssuer(), session.refresh_token, {
                    resource: env.RESOURCE_URI,
                })
                await setAll({
                    access_token: res.access_token,
                    refresh_token: res.refresh_token || null,
                    id_token: res.id_token || null,
                    expired_at: (res.expires_in || 0) * 1000 + new Date().getTime()
                }, sid)
                params.set("x-access-token", res.access_token);
                params.set("x-user", res.id_token?.split(".")[1] || "");
                params.set("x-uid", String(await getUid(res.id_token!)));
            } catch {
                response = NextResponse.redirect(buildUrl(`${pathname}${search}`, request.url));
            }
        } else if ("access_token" in session) {
            params.set("x-access-token", session.access_token);
            params.set("x-user", session.id_token.split(".")[1]);
            params.set("x-uid", String(await getUid(session.id_token)));
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
        name: env.SESSION_COOKIE_NAME,
        value: sid,
        secure: env.SESSION_COOKIE_SECURE ? env.SESSION_COOKIE_SECURE === "true" : env.NODE_ENV === "production",
        maxAge: env.SESSION_TTL,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
    });
    return response;
};

export const config = {
    matcher: ["/((?!_next/static|_next/image|.well-known|favicon.ico|sitemap.xml|robots.txt|api/callback).*)"],
};

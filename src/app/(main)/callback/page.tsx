import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@heroui/react";
import * as client from "openid-client";
import { env } from "@/util/env";
import { issuer } from "@/util/oauth2";
import { get, has, setAll } from "@/util/session";

interface PageProps {
    searchParams: Promise<{
        [key: string]: string
    }>
}

const Error = ({ next }: { next?: string }) => {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="text-center">
                <h1 className="mb-4 text-2xl font-bold">请求非法，请稍后再试</h1>
                <Link href={`/login${next ? `?next=${next}` : ""}`}>
                    <Button>重新登录</Button>
                </Link>
            </div>
        </div>
    );
};

const Page = async ({ searchParams }: PageProps) => {
    const params = await searchParams;
    const next = await get("next");
    if (!(await has("state")) || "error" in params || !("state" in params)) {
        return <Error next={next} />;
    }
    try {
        const url = new URL(env.REDIRECT_URI);
        for (const [k, v] of Object.entries(params)) {
            url.searchParams.set(k, v);
        }
        const res = await client.authorizationCodeGrant(issuer, url, {
            pkceCodeVerifier: await get("code_verifier"),
            expectedState: await get("state"),
        }, {
            resource: env.RESOURCE_URI,
        });
        await setAll({
            access_token: res.access_token,
            refresh_token: res.refresh_token || null,
            id_token: res.id_token || null,
            expired_at: (res.expires_in || 0) * 1000 + new Date().getTime()
        })
    } catch {
        return (
            <Error next={next} />
        );
    }
    if (next) {
        redirect(decodeURIComponent(next));
    }
    redirect("/");
};

export default Page;

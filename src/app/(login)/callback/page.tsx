import { redirect } from "next/navigation";
import * as client from "openid-client";
import { LinkButton } from "@/component/navigation/button";
import { issuer } from "@/service/oauth2";
import { get, has, setAll } from "@/service/session";
import { env } from "@/util/env";

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
                <LinkButton href={`/login${next ? `?next=${next}` : ""}`}>
                    重新登录
                </LinkButton>
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
        });
        await setAll({
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

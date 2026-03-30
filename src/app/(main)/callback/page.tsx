import { redirect } from "next/navigation";
import * as client from "openid-client";
import { Error } from "@/component/error";
import { env } from "@/util/env";
import { issuer } from "@/util/oauth2";
import { get, has, setAll } from "@/util/session";

interface PageProps {
    searchParams: Promise<{
        [key: string]: string
    }>
}

const Page = async ({ searchParams }: PageProps) => {
    const params = await searchParams;
    if (!(await has("state")) || "error" in params || !("state" in params)) {
        return <Error next={await get("next")} />;
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
        if (await has("next")) {
            redirect(decodeURIComponent(await get("next")));
        }
        redirect("/")
    } catch {
        const next = await get("next");
        return (
            <Error next={next} />
        );
    }
};

export default Page;

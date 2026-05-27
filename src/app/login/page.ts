import { redirect } from "next/navigation";
import * as client from "openid-client";
import { issuer } from "@/service/oauth2";
import { set } from "@/service/session";
import { env } from "@/util/env";

interface PageProps {
    searchParams: Promise<{
        next?: string
    }>
}

const Page = async ({searchParams}: PageProps) => {
    const next = (await searchParams).next
    if (next && next.startsWith("/")) {
        await set("next", next)
    }
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();
    await set("code_verifier", codeVerifier)
    await set("state", state)
    const url = client.buildAuthorizationUrl(issuer, {
        redirect_uri: env.REDIRECT_URI,
        scope: "openid profile email custom_data offline_access",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        prompt: "consent",
        state,
    });
    redirect(url.href)
}

export default Page

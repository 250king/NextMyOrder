import { redirect } from "next/navigation";
import * as client from "openid-client";
import { env } from "@/util/env";
import { issuer } from "@/util/oauth2";
import { set } from "@/util/session";

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
        scope: "openid profile email custom_data offline_access admin:all",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        resource: env.RESOURCE_URI,
        prompt: "consent",
        state,
    });
    redirect(url.href)
}

export default Page

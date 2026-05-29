import { redirect } from "next/navigation";
import * as client from "openid-client";
import { issuer } from "@/service/client/oauth2";
import { clear } from "@/service/session";
import { getContext } from "@/util/context";

const Page = async () => {
    const context = await getContext();
    await client.tokenRevocation(issuer, context.refreshToken!)
    await clear()
    redirect(issuer.serverMetadata().end_session_endpoint!);
};

export default Page;

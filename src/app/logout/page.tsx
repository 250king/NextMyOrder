import { redirect } from "next/navigation";
import * as client from "openid-client";
import { getIssuer } from "@/service/oauth2";
import { clear } from "@/service/session";
import { getContext } from "@/util/context";

const Page = async () => {
    const context = await getContext();
    await client.tokenRevocation(await getIssuer(), context.refreshToken)
    await clear()
    redirect((await getIssuer()).serverMetadata().end_session_endpoint!);
};

export default Page;

import Container from "@/app/identify/container";
import prisma from "@repo/util/data/database";
import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {headers} from 'next/headers';

const Page = async (props: {
    searchParams: Promise<{
        callback: string,
        token: string,
    }>,
}) => {
    const callback = (await props.searchParams).callback;
    const token = (await props.searchParams).token;
    const cookie = await cookies();
    const header = await headers();
    const user = await prisma.user.findUnique({
        where: {
            id: Number(header.get("X-User-Id")),
        },
    });
    if (Number(cookie.get('user_id')?.value) === user?.id) {
        return NextResponse.redirect(callback);
    }

    return (
        <Container data={user!} callback={callback} token={token}/>
    );
};

export default Page;

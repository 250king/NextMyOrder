import prisma from "@repo/util/data/database";
import Container from "@/app/confirm/container";
import {headers} from "next/headers";
import {NextResponse} from "next/server";

const Page = async () => {
    const header = await headers();
    const data = JSON.parse(header.get("X-Jwt-Payload")!);
    const userId = Number(header.get("X-User-Id"));
    const groupUser = await prisma.list.findUnique({
        where: {
            userId_groupId: {
                userId: userId,
                groupId: Number(data.groupId),
            },
        },
        include: {
            group: true,
            user: true,
        },
    });

    if (!groupUser) {
        return new NextResponse('Not found: record invalid', {status: 404});
    }
    return (
        <Container data={groupUser}/>
    );
};

export default Page;

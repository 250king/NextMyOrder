import database from "@/util/data/database";
import Container from "@/app/(ui)/group/[groupId]/user/[userId]/container";
import {notFound} from "next/navigation";

export const revalidate = 0;

const Page = async (props: {
    params: Promise<{
        groupId: number,
        userId: number,
    }>,
}) => {
    const groupId = Number((await props.params).groupId);
    const userId = Number((await props.params).userId);
    const list = await database.list.findUnique({
        where: {
            userId_groupId: {
                userId: userId,
                groupId: groupId,
            },
        },
        include: {
            user: true,
            group: true,
        },
    });
    if (!list) {
        return notFound();
    }

    return (
        <Container data={list}/>
    );
};

export default Page;

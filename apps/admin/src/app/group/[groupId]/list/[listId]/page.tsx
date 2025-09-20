import Container from "@/app/group/[groupId]/list/[listId]/container";
import database from "@repo/util/data/database";
import {notFound} from "next/navigation";

export const revalidate = 0;

const Page = async (props: {
    params: Promise<{
        listId: number,
    }>,
}) => {
    const listId = Number((await props.params).listId);
    const list = await database.list.findUnique({
        where: {
            id: listId,
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

import Container from "@/app/group/[groupId]/list/[listId]/container";
import database from "@repo/util/data/database";
import {notFound} from "next/navigation";

const Page = async (props: {
    params: Promise<{
        listId: number,
        groupId: number,
    }>,
}) => {
    const listId = Number((await props.params).listId);
    const groupId = Number((await props.params).groupId);
    const list = await database.list.findUnique({
        where: {
            id: listId,
        },
        include: {
            user: {
                include: {
                    orders: {
                        where: {
                            item: {
                                groupId: groupId,
                            },
                            status: {
                                not: "pending",
                            },
                        },
                    },
                },
            },
            group: true,
        },
    });
    if (!list) {
        return notFound();
    }

    return (
        <Container data={list} hidden={list.user.orders.length !== 0}/>
    );
};

export default Page;

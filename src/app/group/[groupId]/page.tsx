import React from "react";
import Container from "@/app/group/[groupId]/container";
import database from "@/util/data/database";
import {notFound} from "next/navigation";

export const revalidate = 0;

const Page = async (props: {
    params: Promise<{
        groupId: number,
    }>,
}) => {
    const groupId = Number((await props.params).groupId);
    const group = await database.group.findUnique({
        where: {
            id: groupId,
        },
    });

    if (!group) {
        return notFound();
    }

    return (
        <Container data={group}/>
    );
};

export default Page;

import React from "react";
import Container from "@/app/group/[groupId]/container";
import database from "@repo/util/data/database";
import {notFound} from "next/navigation";

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

import React from "react";
import database from "@repo/util/data/database";
import SummaryContainer from "@/app/group/[groupId]/purchase/container";
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
        <SummaryContainer data={group}/>
    );
};

export default Page;

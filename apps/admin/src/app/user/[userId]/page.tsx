import React from "react";
import Container from "@/app/user/[userId]/container";
import database from "@repo/util/data/database";
import {notFound} from "next/navigation";

export const revalidate = 0;

const Page = async (props: {
    params: Promise<{
        userId: number,
    }>,
}) => {
    const userId = Number((await props.params).userId);
    const user = await database.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        return notFound();
    }

    return (
        <Container data={user}/>
    );
};

export default Page;

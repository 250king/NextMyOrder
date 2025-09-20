import React from "react";
import Container from "@/app/delivery/[deliveryId]/container";
import database from "@repo/util/data/database";
import {notFound} from "next/navigation";

export const revalidate = 0;

const Page = async (props: {
    params: Promise<{
        deliveryId: number,
    }>,
}) => {
    const deliveryId = Number((await props.params).deliveryId);
    const delivery = await database.delivery.findUnique({
        where: {
            id: deliveryId,
        },
        include: {
            user: true,
        },
    });
    if (!delivery) {
        return notFound();
    }

    return (
        <Container data={delivery}/>
    );
};

export default Page;

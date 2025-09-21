import React from "react";
import Container from "@/app/delivery/[deliveryId]/container";
import database from "@repo/util/data/database";
import {notFound} from "next/navigation";
import {getSetting} from "@repo/util/data/setting";

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
    const setting = await getSetting();

    return (
        <Container data={delivery} setting={setting}/>
    );
};

export default Page;

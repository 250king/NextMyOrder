import React from "react";
import Container from "@/app/shipping/[shippingId]/check/container";
import database from "@repo/util/data/database";
import {notFound} from "next/navigation";

const Page = async (props: {
    params: Promise<{
        shippingId: number,
    }>,
}) => {
    const shippingId = Number((await props.params).shippingId);
    const shipping = await database.shipping.findUnique({
        where: {
            id: shippingId,
        },
    });

    if (!shipping) {
        return notFound();
    }

    return (
        <Container data={shipping}/>
    );
};

export default Page;

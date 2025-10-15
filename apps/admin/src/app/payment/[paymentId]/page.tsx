import React from "react";
import Container from "@/app/payment/[paymentId]/container";
import database from "@repo/util/data/database";
import {notFound} from "next/navigation";

const Page = async (props: {
    params: Promise<{
        paymentId: number,
    }>,
}) => {
    const paymentId = Number((await props.params).paymentId);
    const payment = await database.payment.findUnique({
        where: {
            id: paymentId,
        },
    });
    if (!payment) {
      return notFound();
    }

    return (
        <Container data={payment}/>
    );
};

export default Page;

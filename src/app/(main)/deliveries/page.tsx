import React from "react";
import { getDeliveryController } from "@/api/generated/delivery-controller/delivery-controller";
import { FindAll3Params } from "@/api/model";
import { DeliveryCard } from "@/component/card/delivery";
import { getConfig, getContext } from "@/util/context";

type PageProps = {
    searchParams: Promise<FindAll3Params>;
}

const Page = async ({searchParams}: PageProps) => {
    const context = await getContext();
    const data = await searchParams;
    const deliveries = await getDeliveryController().findAll3(data, getConfig(context))

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">分发</h1>
                <DeliveryCard {...deliveries} {...data} isAdmin={context.isAdmin}/>
            </div>
        </div>
    )
}

export default Page

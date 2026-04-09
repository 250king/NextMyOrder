import { Tabs } from "@heroui/react";
import { getDeliveryController } from "@/api/generated/delivery-controller/delivery-controller";
import { getConfig, getContext } from "@/util/context";

type PageProps = {
    params: Promise<{
        deliveryId: number;
    }>;
};

const Page = async ({params}: PageProps) => {
    const query = await params;
    const context = await getContext();
    const delivery = await getDeliveryController().findById(query.deliveryId, getConfig(context));
    
    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">修改信息 #{delivery.id}</h1>
                <Tabs>
                    <Tabs.ListContainer>

                    </Tabs.ListContainer>
                </Tabs>
            </div>
        </div>
    );
}

export default Page;

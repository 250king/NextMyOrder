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
                <div className="flex justify-center">
                    <Tabs className="w-full max-w-md">
                        <Tabs.ListContainer>
                            <Tabs.List aria-label="Options">
                                <Tabs.Tab id="manual">
                                    手动提交
                                    <Tabs.Indicator />
                                </Tabs.Tab>
                                <Tabs.Tab id="address">
                                    通过地址簿提交
                                    <Tabs.Indicator />
                                </Tabs.Tab>
                            </Tabs.List>
                        </Tabs.ListContainer>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default Page;

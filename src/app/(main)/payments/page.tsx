import { getPaymentController } from "@/api/generated/payment-controller/payment-controller";
import { FindAll1Params } from "@/api/model";
import { PaymentCard } from "@/component/card/payment";
import { getConfig, getContext } from "@/util/context";

interface PageProps {
    searchParams: Promise<FindAll1Params>;
}

const Page = async ({ searchParams }: PageProps) => {
    const params = await searchParams;
    const context = await getContext();
    const payments = await getPaymentController().findAll1(
        {
            type: params.type,
            method: params.method,
            page: params.page,
        },
        getConfig(context)
    );

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">账单</h1>
                <PaymentCard
                    type={params.type}
                    method={params.method}
                    page={params.page}
                    items={payments.items}
                    total={payments.total}
                    isAdmin={context.isAdmin}
                />
            </div>
        </div>
    );
};

export default Page;

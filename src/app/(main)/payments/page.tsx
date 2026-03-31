import { getPaymentController } from "@/api/generated/payment-controller/payment-controller";
import { PaymentResponseMethod, PaymentResponseType } from "@/api/model";
import { PaymentCard } from "@/component/card/payment";
import { PaymentFilters } from "@/component/filter/payment";
import { Pagination } from "@/component/pagination";
import { getConfig, getContext } from "@/util/context";

interface PageProps {
    searchParams: Promise<{
        type?: string;
        method?: string;
        page?: string;
    }>;
}

export const dynamic = "force-dynamic";

const Page = async ({ searchParams }: PageProps) => {
    const params = await searchParams;
    const context = await getContext();
    const payments = await getPaymentController().findAll1(
        {
            type: params.type === "ALL" ? undefined : (params.type as PaymentResponseType),
            method: params.method === "ALL" ? undefined : (params.method as PaymentResponseMethod),
            page: params.page ? parseInt(params.page) : 1,
        },
        getConfig(context)
    );

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="mb-4 text-2xl font-bold">账单</h1>
                <PaymentFilters method={params.method} type={params.type} />
                <p className="text-default-500 text-sm">共找到{payments.total}条记录</p>
                <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
                    {payments.items.map((item) => (
                        <div className="mb-4 break-inside-avoid" key={item.id}>
                            <PaymentCard data={item} isAdmin={context.isAdmin} />
                        </div>
                    ))}
                </div>
                <Pagination total={payments.total} page={params.page}/>
            </div>
        </div>
    );
};

export default Page;

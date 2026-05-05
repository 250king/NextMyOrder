import { eq } from "drizzle-orm";
import notFound from "@/app/not-found";
import { LinkButton } from "@/component/navigation/button";
import { db } from "@/service/db";
import { payment } from "@/service/db/schema";
import { cancelOrder, generateUrl } from "@/service/jd";
import { genReqNum } from "@/util/string";

type PageProps = {
    params: Promise<{
        paymentId: number;
    }>;
};

const Page = async ({ params }: PageProps) => {
    const query = await params;
    const result = await db.query.payment.findFirst({
        where: eq(payment.id, query.paymentId),
    });
    if (!result) {
        return notFound();
    }
    if (result.paidAt) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-bold">该账单已完成支付，请勿重复支付</h1>
                    <LinkButton href="/payments">返回</LinkButton>
                </div>
            </div>
        );
    }
    if (result.requestId) {
        await cancelOrder(result.requestId);
    }
    const requestNum = genReqNum(result.id);
    const amount = (result.amount * result.currencyRate * 1.0045).toFixed(2);
    const result = generateUrl(requestNum, )

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">扫码支付</h1>
            </div>
        </div>
    );
};

export default Page;

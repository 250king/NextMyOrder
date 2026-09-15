import { and, eq } from "drizzle-orm";
import notFound from "@/app/not-found";
import { LinkButton } from "@/component/common/link";
import { PaymentWeight } from "@/component/weight/payment";
import { cancelOrder, generateUrl } from "@/service/client/jdpay";
import { db } from "@/service/db";
import { Payment } from "@/service/db/schema";
import { getContext } from "@/util/context";
import { genReqNum } from "@/util/cover";

type PageProps = {
    params: Promise<{
        paymentId: number;
    }>;
};

const Page = async ({ params }: PageProps) => {
    const query = await params;
    const context = await getContext();
    const data = await db.query.Payment.findFirst({
        where: and(eq(Payment.id, query.paymentId), eq(Payment.userId, context.uid!)),
    });

    if (!data) {
        return notFound();
    }
    if (data.paidAt) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-bold">该账单已完成支付，请勿重复支付</h1>
                    <LinkButton back>返回</LinkButton>
                </div>
            </div>
        );
    }
    if (data.currency !== "CNY") {
        throw new Error("当前支付通道仅支持人民币结算");
    }
    if (data.requestId) {
        await cancelOrder(data.requestId);
    }

    const requestNum = genReqNum(data.id);
    const amount = (data.amount / (1 - 0.0038)).toFixed(2);
    const res = await generateUrl(requestNum, amount);
    await db
        .update(Payment)
        .set({
            requestId: requestNum,
        })
        .where(eq(Payment.id, data.id));

    return (
        <div className="container mx-auto flex flex-1 flex-col p-6">
            <h1 className="text-2xl font-bold">扫码支付</h1>
            <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="text-center">支持以下支付方式</div>
                    <div className="flex items-center justify-center gap-3 text-3xl">
                        <span className="icon-[ri--alipay-fill] bg-blue-600" />
                        <span className="icon-[ri--wechat-pay-fill] bg-green-600" />
                        <span className="icon-[custom--jdpay]" />
                        <span className="icon-[custom--unipay]" />
                    </div>
                    <PaymentWeight url={res.data.data.url} data={data} />
                </div>
            </div>
        </div>
    );
};

export default Page;

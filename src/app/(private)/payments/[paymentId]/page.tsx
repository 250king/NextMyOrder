import React from "react";
import { notFound } from "next/navigation";
import { Alert, Button, Chip, Surface } from "@heroui/react";
import { and, eq } from "drizzle-orm";
import { LinkButton } from "@/component/common/link";
import { PaymentTab } from "@/component/tab/payment";
import { db } from "@/service/db";
import { Payment } from "@/service/db/schema";
import { colorMap, iconMap, methodMap } from "@/type/payment";
import { getContext } from "@/util/context";
import { currency, date } from "@/util/cover";

type PageProps = {
    params: Promise<{
        paymentId: number;
    }>;
    searchParams: Promise<{
        tab?: string;
    }>;
};

const Page = async ({ params, searchParams }: PageProps) => {
    const query = await params;
    const search = await searchParams;
    const context = await getContext();
    const data = await db.query.Payment.findFirst({
        where: and(eq(Payment.id, query.paymentId), eq(Payment.userId, context.uid!)),
    });
    if (!data) {
        return notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <header className="flex flex-col gap-3">
                    <h1 className="text-2xl font-bold">账单管理 #{data.id}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        {data.paidAt ? (
                            <Chip variant="primary" color={colorMap[data.method!]}>
                                <span className={`shrink-0 ${iconMap[data.method!]}`} />
                                <Chip.Label>{methodMap[data.method!]}</Chip.Label>
                            </Chip>
                        ) : (
                            <Chip variant="primary" color="warning">
                                待付款
                            </Chip>
                        )}
                    </div>
                </header>
                {!data.paidAt && (
                    <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>当前账单未付款</Alert.Title>
                            <Alert.Description>请尽快确认账单是否无误并完成付款，以免影响下一步交易</Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}
                <Surface className="rounded-3xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-base font-semibold">基础信息</h2>
                        {data.paidAt ? (
                            <Button variant="secondary">
                                <span className="icon-[ri--receipt-fill]" />
                                索取凭证
                            </Button>
                        ) : (
                            <LinkButton href={`/payments/${data.id}/pay`} variant="secondary">
                                <span className="icon-[ri--money-cny-circle-fill]" />
                                前往支付
                            </LinkButton>
                        )}
                    </div>
                    <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                        {data.currency != "CNY" && (
                            <div className="min-w-0">
                                <div className="text-muted">汇率</div>
                                <div className="font-medium">
                                    1 {data.currency} = {data.currencyRate} CNY
                                </div>
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="text-muted">创建时间</div>
                            <div className="font-medium">{date(data.createdAt)}</div>
                        </div>
                        {data.paidAt && (
                            <div className="min-w-0">
                                <div className="text-muted">付款时间</div>
                                <div className="font-medium">{date(data.paidAt)}</div>
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="text-muted">备注</div>
                            <div className="font-medium">{data.comment || "-"}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">总金额</div>
                            <div className="text-xl font-bold">
                                {currency(data.amount, data.currency)}
                                {data.currency != "CNY" && (
                                    <span className="px-1 align-baseline text-xs font-medium text-muted">
                                        ≈ {currency(data.amount * data.currencyRate, "CNY")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Surface>
                <PaymentTab data={data} search={search} />
            </div>
        </div>
    );
};

export default Page;

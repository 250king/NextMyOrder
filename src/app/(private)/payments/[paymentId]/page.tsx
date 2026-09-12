import React from "react";
import { notFound } from "next/navigation";
import { Alert, Button, Chip, Surface, Tabs } from "@heroui/react";
import { and, eq } from "drizzle-orm";
import { LinkButton } from "@/component/common/link";
import { LinkTab } from "@/component/common/tab";
import { db } from "@/service/db";
import { Payment } from "@/service/db/schema";
import {
    colorMap,
    iconMap,
    methodMap,
    referenceMap,
    typeIconMap,
    typeMap,
} from "@/type/payment";
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
    const currentTab = search.tab === "refund" ? "refund" : "detail";
    const data = await db.query.Payment.findFirst({
        where: and(eq(Payment.id, query.paymentId), eq(Payment.userId, context.uid!)),
        with: {
            items: true,
        },
    });

    if (!data) {
        return notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <header className="flex flex-col gap-3">
                    <h1 className="text-2xl font-bold">账单 #{data.id}</h1>
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
                            <Alert.Description>请确认下方各项费用无误后完成付款。</Alert.Description>
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
                        <div className="min-w-0">
                            <div className="text-muted">收款项</div>
                            <div className="font-medium">{data.items.length} 项</div>
                        </div>
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
                            <div className="text-muted">应付金额</div>
                            <div className="text-xl font-bold">{currency(data.amount, data.currency)}</div>
                        </div>
                    </div>
                </Surface>

                <Tabs selectedKey={currentTab} className="w-full">
                    <Tabs.ListContainer className="w-fit max-w-full">
                        <Tabs.List className="w-fit max-w-full *:w-fit *:whitespace-nowrap">
                            <LinkTab href={`/payments/${data.id}?tab=detail`} id="detail">
                                收款明细
                                <Tabs.Indicator />
                            </LinkTab>
                            <LinkTab href={`/payments/${data.id}?tab=refund`} id="refund">
                                退款详情
                                <Tabs.Indicator />
                            </LinkTab>
                        </Tabs.List>
                    </Tabs.ListContainer>
                    <div className="w-full">
                        <Tabs.Panel className="pt-4" id="detail">
                            {data.items.length === 0 ? (
                                <div className="py-10 text-center text-sm text-muted">暂无收款明细</div>
                            ) : (
                                <div>
                                    {data.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col gap-3 border-b border-separator py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                                        >
                                            <div className="min-w-0 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Chip variant="primary">
                                                        <span className={typeIconMap[item.type]} />
                                                        <Chip.Label>{typeMap[item.type]}</Chip.Label>
                                                    </Chip>
                                                    <span className="text-muted font-mono text-xs">
                                                        {referenceMap[item.type]} #{item.refId}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium">{item.name}</div>
                                                    {item.description && (
                                                        <div className="mt-1 text-sm text-muted">{item.description}</div>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted">
                                                    {currency(item.price, item.currency)} × {item.count} {item.unit}
                                                    {item.currency !== data.currency && (
                                                        <span className="ml-2">
                                                            · 1 {item.currency} = {item.currencyRate} {data.currency}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shrink-0 sm:text-right">
                                                {item.currency !== data.currency && (
                                                    <div className="text-sm text-muted">
                                                        {currency(item.total, item.currency)}
                                                    </div>
                                                )}
                                                <div className="text-lg font-semibold">
                                                    {currency(item.settledTotal, data.currency)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Tabs.Panel>
                        <Tabs.Panel className="pt-4" id="refund">
                            <div className="min-h-48 rounded-lg border border-dashed border-separator p-6" />
                        </Tabs.Panel>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default Page;

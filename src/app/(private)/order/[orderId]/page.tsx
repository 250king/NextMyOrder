import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip, Surface } from "@heroui/react";
import { and, eq } from "drizzle-orm";
import { LinkButton } from "@/component/common/link";
import { db } from "@/service/db";
import { Order } from "@/service/db/schema";
import { colorMap, statusMap } from "@/type/order";
import { getContext } from "@/util/context";
import { currency, date } from "@/util/cover";

type PageProps = {
    params: Promise<{ orderId: number }>;
};

const Page = async ({ params }: PageProps) => {
    const { orderId } = await params;
    const context = await getContext();
    const data = await db.query.Order.findFirst({
        where: and(eq(Order.id, orderId), eq(Order.userId, context.uid!)),
    });

    if (!data) {
        notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <header className="flex flex-col gap-3">
                    <h1 className="text-2xl font-bold">订单 #{data.id}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <Chip variant="primary" color={colorMap[data.status]}>
                            {statusMap[data.status]}
                        </Chip>
                    </div>
                </header>

                <Surface className="rounded-3xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-base font-semibold">订单信息</h2>
                        <LinkButton href={data.itemUrl} variant="secondary">
                            <span className="icon-[ri--external-link-line]" />
                            商品页面
                        </LinkButton>
                    </div>
                    <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                        <div className="min-w-0 md:col-span-2">
                            <div className="text-muted">商品</div>
                            <div className="font-medium">{data.itemName}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">团购</div>
                            <Link href={`/groups/${data.groupId}`} className="font-medium text-focus hover:underline">
                                #{data.groupId}
                            </Link>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">单价</div>
                            <div className="font-medium">{currency(data.itemPrice, "JPY")}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">数量</div>
                            <div className="font-medium">× {data.count}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">商品金额</div>
                            <div className="font-medium">{currency(data.itemPrice * data.count, "JPY")}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">国际运单</div>
                            <div className="font-medium">
                                {data.transitId ? (
                                    <Link
                                        href={`/groups/${data.groupId}/transit/${data.transitId}`}
                                        className="text-focus hover:underline"
                                    >
                                        #{data.transitId}
                                    </Link>
                                ) : (
                                    "-"
                                )}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">创建时间</div>
                            <div className="font-medium">{date(data.createdAt)}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">更新时间</div>
                            <div className="font-medium">{date(data.updatedAt)}</div>
                        </div>
                        <div className="min-w-0 md:col-span-3">
                            <div className="text-muted">备注</div>
                            <div className="font-medium">{data.comment || "-"}</div>
                        </div>
                    </div>
                </Surface>
            </div>
        </div>
    );
};

export default Page;

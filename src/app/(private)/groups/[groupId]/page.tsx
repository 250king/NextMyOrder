import React from "react";
import { notFound } from "next/navigation";
import { Alert, Chip, Surface } from "@heroui/react";
import { and, eq, exists } from "drizzle-orm";
import { db } from "@/service/db";
import { Group, List } from "@/service/db/schema";
import { colorMap, statusMap } from "@/type/group";
import { getContext } from "@/util/context";
import { date } from "@/util/cover";

type PageProps = {
    params: Promise<{
        groupId: number;
    }>;
};

const Page = async ({ params }: PageProps) => {
    const path = await params;
    const context = await getContext();
    const sql = exists(
        db
            .select()
            .from(List)
            .where(and(eq(List.groupId, Group.id), eq(List.userId, context.uid!)))
    );
    const data = await db.query.Group.findFirst({
        where: and(eq(Group.id, path.groupId), ...(context.isAdmin ? [] : [sql])),
    });
    if (!data) {
        notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <header className="flex flex-col gap-3">
                    <h1 className="text-2xl font-bold">{data.name}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <Chip className="shrink-0" variant="primary" color={colorMap[data.status]}>
                            {statusMap[data.status]}
                        </Chip>
                    </div>
                </header>
                {data.status == "PENDING" && (
                    <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>团购截止时间为 {date(data.deadline)}</Alert.Title>
                            <Alert.Description>请在截止时间前完成选购，过后将无法进行选购操作。</Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}
                <Surface className="rounded-3xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-base font-semibold">基础信息</h2>
                    </div>
                    <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                        <div className="min-w-0">
                            <div className="text-muted">群号</div>
                            <div className="font-medium">{data.qq}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">截至时间</div>
                            <div className="font-medium">{date(data.deadline)}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">创建时间</div>
                            <div className="font-medium">{date(data.createdAt)}</div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-muted">更新时间</div>
                            <div className="font-medium">{date(data.updatedAt)}</div>
                        </div>
                    </div>
                </Surface>
            </div>
        </div>
    );
};

export default Page;

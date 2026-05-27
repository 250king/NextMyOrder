import { and, eq, exists, SQL } from "drizzle-orm";
import { GroupCard } from "@/component/card/group";
import { db } from "@/service/db";
import { Group, List } from "@/service/db/schema";
import { GroupQuery } from "@/type/group";
import { getContext } from "@/util/context";
import { getPagination } from "@/util/query";

type PageProps = {
    searchParams: Promise<GroupQuery>;
}

const Page = async ({ searchParams }: PageProps) => {
    const query = await searchParams;
    const context = await getContext();
    const pagination = getPagination(query);
    const filters: SQL[] = [];
    if (!context.isAdmin) {
        filters.push(
            exists(
                db.select().from(List).where(and(eq(List.groupId, Group.id), eq(List.userId, context.uid!)))
            )
        );
    } else if (query.userId) {
        filters.push(
            exists(
                db.select().from(List).where(and(eq(List.groupId, Group.id), eq(List.userId, query.userId)))
            )
        );
    }
    if (query.status) {
        filters.push(eq(Group.status, query.status));
    }
    const [items, total] = await Promise.all([
        await db.query.Group.findMany({
            where: and(...filters),
            ...pagination,
            orderBy: (group, { desc }) => [desc(group.createdAt)],
        }),
        db.$count(Group, and(...filters)),
    ]);

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="mb-4 text-2xl font-bold">团购</h1>
                <GroupCard {...query} items={items} total={total} isAdmin={context.isAdmin} />
            </div>
        </div>
    );
};

export default Page;

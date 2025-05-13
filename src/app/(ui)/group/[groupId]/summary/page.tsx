import database from "@/util/database";
import SummaryContainer from "@/component/container/summary";
import {User} from "@prisma/client";

interface Props {
    params: Promise<{groupId: number}>
}

const summaryItem = async (id: number) => {
    const orderSummary = await database.order.groupBy({
        by: ["itemId"],
        where: {
            item: {groupId: id}
        },
        _sum: {
            count: true
        }
    });
    return await Promise.all(
        orderSummary.map(async row => {
            const item = await database.item.findUnique({where: {id: row.itemId}});
            const price = Number(item?.price)
            return {
                id: row.itemId,
                name: item?.name,
                price: price,
                count: row._sum.count,
                total: price * (row._sum.count || 0)
            };
        })
    );
}

const summaryUser = async (id: number) => {
    const orders = await database.order.findMany({
        where: {item: {groupId: id}},
        include: {
            item: {
                select: {price: true}
            },
            user: true
        }
    });
    const userSpendMap: Record<number, User & {total: number}> = {};
    for (const order of orders) {
        const amount = Number(order.count) * Number(order.item.price);
        userSpendMap[order.userId] = {
            ...order.user,
            total: (userSpendMap[order.userId]?.total || 0) + amount
        };
    }
    return Object.entries(userSpendMap).map(([, result]) => result);
}

const summaryWeight = async (id: number) => {
    const orders = await database.order.findMany({
        where: {
            item: {groupId: id}
        },
        include: {
            user: { select: { id: true, name: true, qq: true } },
            item: { select: { weight: true } }
        }
    });
    const hasMissingWeight = orders.some(order => order.item.weight == null);
    if (hasMissingWeight) {
        return [];
    }
    const map = new Map<number, {
        id: number;
        name: string;
        qq: string;
        total: number;
    }>();
    let grandTotal = 0;
    for (const order of orders) {
        const { id, name, qq } = order.user;
        const weight = Number(order.item.weight);
        const total = weight * order.count;
        grandTotal += total;
        if (!map.has(id)) {
            map.set(id, { id: id, name, qq, total: total });
        } else {
            map.get(id)!.total += total;
        }
    }
    return Array.from(map.values()).map(user => ({
        ...user,
        ratio: grandTotal === 0 ? 0 : user.total / grandTotal * 100
    }));
}

const Page = async (props: Props) => {
    const id = Number((await props.params).groupId);
    const item = await summaryItem(id);
    const user = await summaryUser(id);
    const weight = await summaryWeight(id);
    return (
        <SummaryContainer item={item} user={user} weight={weight}/>
    );
}

export default Page;

import database from "@/util/database";
import SummaryContainer from "@/component/container/summary";
import {User} from "@prisma/client";

interface Props {
    params: Promise<{groupId: number}>
}

const summaryItem = async (id: number) => {
    const sum = await database.order.groupBy({
        by: [
            "itemId"
        ],
        where: {
            item: {
                groupId: id
            },
            status: {
                not: "failed"
            }
        },
        _sum: {
            count: true,
        }
    });
    const items = new Map((await database.item.findMany({
        where: {
            id: {
                in: sum.map(i => i.itemId)
            }
        }
    })).map(i => [i.id, i]))
    return sum.map(i => ({
        id: i.itemId,
        name: items.get(i.itemId)?.name,
        url: items.get(i.itemId)?.url,
        price: items.get(i.itemId)?.price,
        count: i._sum.count,
        total: (items.get(i.itemId)?.price ?? 0) * (i._sum.count ?? 0)
    }))
}

const summaryUser = async (id: number) => {
    const orders = await database.order.findMany({
        where: {
            item: {
                groupId: id
            },
            status: {
                not: "failed"
            }
        },
        include: {
            item: {
                select: {
                    price: true
                }
            },
            user: true
        }
    });
    const userSpendMap: Record<number, User & {total: number}> = {};
    for (const order of orders) {
        const amount = order.count * order.item.price;
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
            item: {
                groupId: id
            }
        },
        include: {
            user: true,
            item: true
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
        const {id, name, qq} = order.user;
        const weight = Number(order.item.weight);
        const total = weight * order.count;
        grandTotal += total;
        if (!map.has(id)) {
            map.set(id, {
                id: id,
                total: total,
                name, qq
            });
        } else {
            map.get(id)!.total += total;
        }
    }
    return Array.from(map.values()).map(user => ({
        ...user,
        ratio: grandTotal === 0 ? 0 : user.total / grandTotal * 100
    }));
}

export const revalidate = 0;

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

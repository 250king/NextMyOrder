import database from "@/util/database";
import {NextRequest, NextResponse} from "next/server";
import {queryParser} from "@/util/http/query";

interface Props {
    params: Promise<{groupId: number}>
}

export const GET = async (req: NextRequest, props: Props) => {
    const groupId = Number((await props.params).groupId);
    const query = queryParser(req.nextUrl.searchParams, [], {item: {groupId: groupId}});
    const items = await database.order.findMany({
        ...query,
        include: {
            item: true,
            user: true,
            delivery: true
        }
    })
    const total = await database.order.count({where: query.where});
    return NextResponse.json({items: items, total});
}

export const POST = async (req: NextRequest) => {
    const payload = await req.json();
    const order = await database.order.create({data: {...payload}})
    return NextResponse.json(order, {status: 201})
}

import database from "@/util/database";
import {NextRequest, NextResponse} from "next/server";
import {queryParser} from "@/util/http/query";

export const GET = async (req: NextRequest) => {
    const query = queryParser(req.nextUrl.searchParams, []);
    const deliveries = await database.group.findMany({...query})
    const total = await database.group.count({where: query.where});
    return NextResponse.json({items: deliveries, total});
}

export const POST = async (req: NextRequest) => {
    const payload = await req.json();
    const delivery = await database.delivery.create({
        data: {
            ...payload,
            orders: {
                connect: payload.orders.map((id: number) => ({id}))
            }
        }
    });
    return NextResponse.json(delivery, {status: 201});
}

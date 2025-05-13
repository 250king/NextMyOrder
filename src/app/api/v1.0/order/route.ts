import database from "@/util/database";
import {NextRequest, NextResponse} from "next/server";
import {queryParser} from "@/util/http/query";

export const GET = async (req: NextRequest) => {
    const query = queryParser(req.nextUrl.searchParams, [], {status: "waiting", deliveryId: null});
    const orders = await database.order.findMany({
        ...query,
        include: {
            item: {
                include: {
                    group: true
                }
            },
            user: true,
        }
    })
    const total = await database.order.count({where: query.where});
    return NextResponse.json({items: orders, total});
}

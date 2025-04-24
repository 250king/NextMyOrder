import {NextRequest, NextResponse} from "next/server";
import pagingParser from "@/util/paging";
import database from "@/util/database";

export const GET = async (req: NextRequest) => {
    const paging = pagingParser(req.url);
    const users = (await database.user.findMany({
        skip: paging.page * paging.size,
        take: paging.size,
        orderBy: {
            [paging.sort]: paging.order
        }
    })).map(user => ({
        ...user,
        qq: Number(user.qq)
    }))
    const total = await database.user.count();
    return NextResponse.json({
        items: users,
        total
    });
}

export const PUT = async (req: NextRequest) => {
    const payload = await req.json();
    const user = await database.user.create({
        data: payload,
    });
    return NextResponse.json({
        ...user,
        qq: Number(user.qq)
    }, {
        status: 201
    });
}

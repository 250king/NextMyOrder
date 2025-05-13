import database from "@/util/database";
import {NextRequest, NextResponse} from "next/server";
import {queryParser} from "@/util/http/query";

export const GET = async (req: NextRequest) => {
    const query = queryParser(req.nextUrl.searchParams, ["name", "qq", "email"]);
    const users = (await database.user.findMany({...query}))
    const total = await database.user.count({where: query.where});
    return NextResponse.json({items: users, total});
}

export const POST = async (req: NextRequest) => {
    const payload = await req.json();
    const user = await database.user.create({data: payload});
    return NextResponse.json(user, {status: 201});
}

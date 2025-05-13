import database from "@/util/database";
import {NextRequest, NextResponse} from "next/server";
import {queryParser} from "@/util/http/query";

export const GET = async (req: NextRequest) => {
    const query = queryParser(req.nextUrl.searchParams, ["name", "qq"]);
    const groups = await database.group.findMany({...query})
    const total = await database.group.count({where: query.where});
    return NextResponse.json({items: groups, total});
}

export const POST = async (req: NextRequest) => {
    const payload = await req.json();
    const group = await database.group.create({data: payload});
    return NextResponse.json(group, {status: 201});
}

import database from "@/util/database";
import {NextRequest, NextResponse} from "next/server";
import {queryParser} from "@/util/http/query";

interface Props {
    params: Promise<{groupId: number}>
}

export const GET = async (req: NextRequest, props: Props) => {
    const groupId = Number((await props.params).groupId);
    const query = queryParser(req.nextUrl.searchParams, ["name", "url"], {groupId: groupId});
    const items = (await database.item.findMany({...query}))
    const total = await database.item.count({where: query.where});
    return NextResponse.json({items: items, total});
}

export const POST = async (req: NextRequest, props: Props) => {
    const groupId = Number((await props.params).groupId);
    const payload = await req.json();
    const join = await database.item.create({data: {...payload, groupId: groupId}})
    return NextResponse.json(join, {status: 201})
}

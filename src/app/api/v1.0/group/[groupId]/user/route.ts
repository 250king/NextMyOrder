import database from "@/util/database";
import {NextRequest, NextResponse} from "next/server";
import {queryParser} from "@/util/http/query";

interface Props {
    params: Promise<{groupId: number}>
}

export const GET = async (req: NextRequest, props: Props) => {
    const groupId = Number((await props.params).groupId);
    const query = queryParser(req.nextUrl.searchParams, ["user.name", "user.qq", "user.email"], {groupId: groupId});
    const joined = (await database.join.findMany({...query, include: {user: true}}))
    const total = await database.join.count({where: query.where});
    return NextResponse.json({items: joined, total});
}

export const POST = async (req: NextRequest, props: Props) => {
    const groupId = Number((await props.params).groupId);
    const payload = await req.json();
    const join = await database.join.create({data: {...payload, groupId: groupId}})
    return NextResponse.json(join, {status: 201})
}

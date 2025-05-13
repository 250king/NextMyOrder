import database from "@/util/database";
import {NextRequest, NextResponse} from "next/server";

interface Props {
    params: Promise<{groupId: number}>
}

export const PATCH = async (req: NextRequest, props: Props) => {
    const groupId = Number((await props.params).groupId);
    const payload = await req.json();
    const group = await database.group.update({where: {id: groupId}, data: payload});
    return NextResponse.json(group);
}

export const DELETE = async (_: NextRequest, props: Props) => {
    const groupId = Number((await props.params).groupId);
    await database.group.delete({where: {id: groupId}});
    return new NextResponse(null, {status: 204});
}

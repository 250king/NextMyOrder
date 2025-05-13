import {NextRequest, NextResponse} from "next/server";
import database from "@/util/database";

interface Props {
    params: Promise<{
        groupId: number,
        userId: number
    }>
}

export const DELETE = async (_: NextRequest, props: Props) => {
    const params = await props.params;
    await database.join.delete({where: {userId_groupId: {userId: Number(params.userId), groupId: Number(params.groupId)}}});
    return new NextResponse(null, {status: 204});
}

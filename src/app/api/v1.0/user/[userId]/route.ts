import {NextRequest, NextResponse} from "next/server";
import database from "@/util/database";

interface Props {
    params: Promise<{userId: number}>
}

export const PATCH = async (req: NextRequest, props: Props) => {
    const userId = Number((await props.params).userId);
    const payload = await req.json();
    const user = await database.user.update({where: {id: userId}, data: payload});
    return NextResponse.json(user);
}

export const DELETE = async (_: NextRequest, props: Props) => {
    const userId = Number((await props.params).userId);
    await database.user.delete({where: {id: userId}});
    return new NextResponse(null, {status: 204});
}

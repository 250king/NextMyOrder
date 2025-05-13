import database from "@/util/database";
import {NextRequest, NextResponse} from "next/server";

interface Props {
    params: Promise<{itemId: number}>
}

export const PATCH = async (req: NextRequest, props: Props) => {
    const itemId = Number((await props.params).itemId);
    const payload = await req.json();
    const item = await database.item.update({
        where: {
            id: itemId
        },
        data: payload
    });
    return NextResponse.json(item);
}

export const DELETE = async (_: NextRequest, props: Props) => {
    const itemId = Number((await props.params).itemId);
    await database.item.delete({where: {id: itemId}});
    return new NextResponse(null, {status: 204});
}

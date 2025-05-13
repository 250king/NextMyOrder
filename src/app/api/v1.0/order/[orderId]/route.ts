import database from "@/util/database";
import {NextRequest, NextResponse} from "next/server";

interface Props {
    params: Promise<{orderId: number}>
}

export const PATCH = async (req: NextRequest, props: Props) => {
    const orderId = Number((await props.params).orderId);
    const payload = await req.json();
    const order = await database.order.update({where: {id: orderId}, data: payload});
    return NextResponse.json(order);
}

export const DELETE = async (_: NextRequest, props: Props) => {
    const orderId = Number((await props.params).orderId);
    await database.order.delete({where: {id: orderId}});
    return new NextResponse(null, {status: 204});
}

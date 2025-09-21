import Container from "@/app/delivery/container";
import prisma from "@repo/util/data/database";
import {NextResponse} from "next/server";
import {headers} from "next/headers";

const Page = async () => {
    const header = await headers();
    const data = JSON.parse(header.get("X-Jwt-Payload")!);
    const delivery = await prisma.delivery.findUnique({
        where: {
            id: Number(data.deliveryId),
        },
        include: {
            user: true,
        },
    });

    if (!delivery) {
        return new NextResponse('Not found: record invalid', {status: 404});
    }
    return (
        <Container data={delivery}/>
    );
};

export default Page;

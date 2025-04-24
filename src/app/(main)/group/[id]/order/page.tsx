import React from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import database from "@/util/database";
import OrderTable from "@/component/table/order";
import {notFound} from "next/navigation";

interface Props {
    params: Promise<{id: number}>
}

const Page = async (props: Props) => {
    const id = Number((await props.params).id);
    const orders = await database.order.findMany({
        where: {
            item: {
                groupId: id
            }
        },
        include: {
            item: true,
            user: true
        }
    })
    if (orders.length === 0) {
        return notFound()
    }

    return (
        <Container sx={{mt: 2}} fixed>
            <Button variant="contained" sx={{mb: 2}}>添加</Button>
            <OrderTable orders={orders}/>
        </Container>
    );
}

export default Page;

import React from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import database from "@/util/database";
import ItemTable from "@/component/table/item";
import {notFound} from "next/navigation";

interface Props {
    params: Promise<{id: number}>
}

const Page = async (props: Props) => {
    const id = Number((await props.params).id);
    const items = await database.item.findMany({
        where: {
            groupId: id
        },
        orderBy: {
            id: "asc"
        }
    });
    if (items.length === 0) {
        return notFound()
    }

    return (
        <Container sx={{mt: 2}} fixed>
            <Button variant="contained" sx={{mb: 2}}>添加</Button>
            <ItemTable items={items}/>
        </Container>
    );
}

export default Page;

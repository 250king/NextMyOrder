import React from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import database from "@/util/database";
import GroupTable from "@/component/table/group";

const Page = async () => {
    const groups = await database.group.findMany({
        orderBy: {
            id: "asc"
        }
    });

    return (
        <Container sx={{mt: 2}} fixed>
            <Button variant="contained" sx={{mb: 2}}>添加</Button>
            <GroupTable groups={groups}/>
        </Container>
    );
}

export default Page;

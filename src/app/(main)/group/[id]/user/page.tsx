import React from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import database from "@/util/database";
import {notFound} from "next/navigation";
import JoinTable from "@/component/table/join";

interface Props {
    params: Promise<{id: number}>
}

const Page = async (props: Props) => {
    const id = Number((await props.params).id);
    const users = await database.user.findMany({
        where: {
            groups: {
                some: {
                    groupId: id
                }
            }
        },
        orderBy: {
            id: "asc"
        },
        include: {
            groups: {
                where: {
                    groupId: id
                },
                select: {
                    createAt: true
                }
            }
        }
    });
    if (users.length === 0) {
        return notFound()
    }

    return (
        <Container sx={{mt: 2}} fixed>
            <Button variant="contained" sx={{mb: 2}}>添加</Button>
            <JoinTable users={users}/>
        </Container>
    );
}

export default Page;

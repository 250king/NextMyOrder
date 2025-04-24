import React from "react";
import Container from "@mui/material/Container";
import database from "@/util/database";
import FunctionsIcon from '@mui/icons-material/Functions';
import Grid from "@mui/material/Grid";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import Typography from "@mui/material/Typography";
import {notFound} from "next/navigation";
import ActionCard from "@/component/card/action";

interface Props {
    params: Promise<{id: number}>
}

const Page = async (props: Props) => {
    const id = Number((await props.params).id);
    const actions = [
        {title: "用户管理", icon: PersonIcon, to: "user"},
        {title: "商品管理", icon: ShoppingBagIcon, to: "item"},
        {title: "订单管理", icon: ReceiptIcon, to: "order"},
        {title: "汇总", icon: FunctionsIcon, to: "summary"},
        {title: "分发", icon: LocalShippingIcon, to: "delivery"}
    ]
    const group = await database.group.findUnique({
        where: {
            id: id
        }
    });
    if (!group) {
        return notFound()
    }

    return (
        <Container sx={{mt: 2}} fixed>
            <Typography variant="h3" sx={{mb: 2}}>{group.name}</Typography>
            <Grid container spacing={2} sx={{mb: 2}}>
                {
                    actions.map((action, index) => (
                        <ActionCard key={index} title={action.title} icon={action.icon} to={`${id}/${action.to}`}/>
                    ))
                }
            </Grid>
        </Container>
    );
}

export default Page;

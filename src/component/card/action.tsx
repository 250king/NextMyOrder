import React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import {NextLinkComposed} from "@/component/link";

interface Props {
    title: string;
    icon: React.ElementType;
    to: string;
}

const ActionCard = (props: Props) => {
    return (
        <Grid component={Card} size={{xs: 12, sm: 6, md: 4}}>
            <CardActionArea component={NextLinkComposed} to={props.to} sx={{width: '100%', height: '100%'}}>
                <CardHeader
                    avatar={
                        <Avatar>
                            <props.icon/>
                        </Avatar>
                    }
                    title={props.title}
                />
            </CardActionArea>
        </Grid>
    );
}

export default ActionCard;

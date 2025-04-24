"use client";
import React from "react";
import AppBar from "@mui/material/AppBar";
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from '@mui/icons-material/Person';
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {NextLinkComposed} from "@/component/link";

const Navbar = () => {
    const [open, setOpen] = React.useState(false);
    const pages = [
        {name: "用户", url: "/user", icon: <PersonIcon/>},
        {name: "团购", url: "/group", icon: <DirectionsBusIcon/>}
    ];

    return (
        <>
            <Drawer open={open} onClose={() => setOpen(false)}>
                <List sx={{width: 250}}>
                    {
                        pages.map((page, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton
                                    component={NextLinkComposed}
                                    to={page.url}
                                    onClick={() => {setOpen(false)}}
                                >
                                    <ListItemIcon>
                                        {page.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={page.name}/>
                                </ListItemButton>
                            </ListItem>
                        ))
                    }
                </List>
            </Drawer>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        sx={{mr: 2}}
                        onClick={() => setOpen(!open)}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6">NextMyOrder</Typography>
                </Toolbar>
            </AppBar>
            <Toolbar/>
        </>
    );
}

export default Navbar;

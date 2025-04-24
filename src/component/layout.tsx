"use client";
import React from "react";
import {createTheme, ThemeProvider} from "@mui/material/styles";

interface Props {
    children: React.ReactNode;
}

const Layout = (props: Props) => {
    const theme = createTheme({
        colorSchemes: {
            dark: true
        }
    })
    return (
        <ThemeProvider theme={theme}>
            {props.children}
        </ThemeProvider>
    );
}

export default Layout;

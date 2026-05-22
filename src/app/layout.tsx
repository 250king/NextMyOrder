import React from "react";
import { Toast } from "@heroui/react";
import { ThemeProvider } from "@wrksz/themes";
import { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "NextMyOrder",
};

const Layout = ({ children }: React.PropsWithChildren) => {
    return (
        <html lang="zh-cn" suppressHydrationWarning>
            <body className="bg-background text-foreground">
                <ThemeProvider>{children}</ThemeProvider>
                <Toast.Provider />
            </body>
        </html>
    );
};

export default Layout;

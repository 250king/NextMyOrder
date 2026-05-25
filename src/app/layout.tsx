import React from "react";
import { Toast } from "@heroui/react";
import { ThemeProvider } from "@wrksz/themes";
import { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "NextMyOrder",
    icons: {
        icon: "https://static.250king.top/image/2026/03/ozvkna9p.png",
    },
};

const Layout = ({ children }: React.PropsWithChildren) => {
    return (
        <html lang="zh-cn" suppressHydrationWarning>
            <body className="bg-background text-foreground">
                <ThemeProvider>
                    <Toast.Provider />
                    <NextTopLoader showSpinner={false} />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
};

export default Layout;

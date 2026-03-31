import React from "react";
import Script from "next/script";
import { Toast } from "@heroui/react";
import { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/component/layout/theme";

const js = `(function() {
    function getTheme() {
    const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    const theme = getTheme();
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
    } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
    }
})();`;

export const metadata: Metadata = {
    title: "NextMyOrder",
};

const Layout = ({ children }: React.PropsWithChildren) => {
    return (
        <html lang="zh-cn" suppressHydrationWarning>
            <body className="bg-background text-foreground">
                <ThemeProvider>{children}</ThemeProvider>
                <Toast.Provider />
                <Script id="" strategy="beforeInteractive">
                    {js.trim().replaceAll("\n", "")}
                </Script>
            </body>
        </html>
    );
};

export default Layout;

"use client";

import React from "react";

export const ThemeProvider = ({children}: React.PropsWithChildren) => {
    React.useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem("theme")) {
                const isDark = e.matches;
                document.documentElement.classList.toggle("dark", isDark);
                document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
            }
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return children
}

import React from "react";
import { Footer } from "@/component/layout/footer";
import { Navbar } from "@/component/layout/navbar";

const Layout = async ({children}: React.PropsWithChildren) => {
    return (
        <div className="flex min-h-dvh flex-col">
            <Navbar/>
            <main className="flex flex-1 flex-col antialiased">{children}</main>
            <Footer />
        </div>
    );
}

export default Layout;

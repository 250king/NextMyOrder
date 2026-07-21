import React from "react";
import { Footer } from "@/component/layout/footer";
import { Navbar } from "@/component/layout/navbar";
import { PrinterProvider } from "@/component/weight/printer";
import { getContext } from "@/util/context";

const Layout = async ({children}: React.PropsWithChildren) => {
    const context = await getContext();

    return (
        <div className="flex min-h-dvh flex-col">
            <Navbar user={context.user} isAdmin={context.isAdmin} />
            <PrinterProvider>
                <main className="flex flex-1 flex-col antialiased">{children}</main>
            </PrinterProvider>
            <Footer />
        </div>
    );
}

export default Layout;

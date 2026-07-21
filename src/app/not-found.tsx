import { LinkButton } from "@/component/common/link";
import { Footer } from "@/component/layout/footer";
import { Navbar } from "@/component/layout/navbar";
import { getContext } from "@/util/context";

const Page = async () => {
    const context = await getContext();

    return (
        <div className="flex min-h-dvh flex-col">
            <Navbar user={context.user} isAdmin={context.isAdmin} />
            <main className="flex flex-1 flex-col antialiased">
                <div className="flex flex-1 flex-col items-center justify-center gap-4">
                    <div className="text-center">
                        <h1 className="mb-4 text-2xl font-bold">啥都没有( T﹏T )</h1>
                        <LinkButton href="/">回到首页</LinkButton>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Page;

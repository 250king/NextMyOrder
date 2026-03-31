import { LinkButton } from "@/component/navigation/button";
import { getContext } from "@/util/context";

const Page = async () => {
    const context = await getContext();
    
    return context.isAdmin ? (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="mb-4 text-2xl font-bold">用户</h1>
            </div>
        </div>
    ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="text-center">
                <h1 className="mb-4 text-2xl font-bold">无权限，请返回首页</h1>
                <LinkButton href="/">返回首页</LinkButton>
            </div>
        </div>
    );
}

export default Page;

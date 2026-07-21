import { LinkButton } from "@/component/common/link";

const Page = () => {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="text-center">
                <h1 className="mb-4 text-2xl font-bold">啥都没有( T﹏T )</h1>
                <LinkButton href="/">回到首页</LinkButton>
            </div>
        </div>
    );
};

export default Page;

import Link from "next/link";
import { Button } from "@heroui/react";

const Page = () => {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="text-center">
                <h1 className="mb-4 text-2xl font-bold">您已退出当前系统</h1>
                <Link href={`/login`}>
                    <Button>重新登录</Button>
                </Link>
            </div>
        </div>
    );
}

export default Page;

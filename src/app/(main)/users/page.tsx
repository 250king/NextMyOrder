import Link from "next/link";
import { Button } from "@heroui/react";
import { getUserController } from "@/api/generated/user-controller/user-controller";
import { FindAll4Params } from "@/api/model";
import { UserTable } from "@/component/table/user";
import { getConfig, getContext } from "@/util/context";

interface PageProps {
    searchParams: Promise<FindAll4Params>;
}

const Page = async ({ searchParams }: PageProps) => {
    const context = await getContext();
    if (!context.isAdmin) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-bold">无权限，请返回首页</h1>
                    <Link href="/">
                        <Button>返回首页</Button>
                    </Link>
                </div>
            </div>
        );
    }
    const query = await searchParams;
    const user = await getUserController().findAll4(
        {
            order: query.order,
            sort: query.sort,
            page: query.page,
            keyword: query.keyword
        },
        getConfig(context)
    );

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">用户</h1>
                <UserTable
                    items={user.items}
                    total={user.total}
                    page={query.page}
                    sort={query.sort}
                    order={query.order}
                    keyword={query.keyword}
                />
            </div>
        </div>
    );
};

export default Page;

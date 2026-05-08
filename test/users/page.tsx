import { getUserController } from "src/api/generated/user-controller/user-controller";
import { FindAll4Params } from "src/api/model";
import { UserTable } from "src/component/table/user";
import { getConfig, getContext } from "src/util/context";

interface PageProps {
    searchParams: Promise<FindAll4Params>;
}

const Page = async ({ searchParams }: PageProps) => {
    const context = await getContext();
    const data = await searchParams;
    const users = await getUserController().findAll4(data, getConfig(context));

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">用户</h1>
                <UserTable {...users} {...data} />
            </div>
        </div>
    );
};

export default Page;

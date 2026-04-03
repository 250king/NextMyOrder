import { getGroupController } from "@/api/generated/group-controller/group-controller";
import { FindAll2Params } from "@/api/model";
import { GroupCard } from "@/component/card/group";
import { getConfig, getContext } from "@/util/context";

interface PageProps {
    searchParams: Promise<FindAll2Params>;
}

const Page = async ({ searchParams }: PageProps) => {
    const query = await searchParams;
    const context = await getContext();
    const groups = await getGroupController().findAll2(
        {
            page: query.page,
            keyword: query.keyword,
        },
        getConfig(context)
    );

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="mb-4 text-2xl font-bold">团购</h1>
                <GroupCard items={groups.items} total={groups.total} page={query.page} keyword={query.keyword} isAdmin={context.isAdmin} />
            </div>
        </div>
    );
};

export default Page;

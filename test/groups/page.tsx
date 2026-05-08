import { getGroupController } from "src/api/generated/group-controller/group-controller";
import { FindAll2Params } from "src/api/model";
import { GroupCard } from "src/component/card/group";
import { getConfig, getContext } from "src/util/context";

type PageProps = {
    searchParams: Promise<FindAll2Params>;
}

const Page = async ({ searchParams }: PageProps) => {
    const data = await searchParams;
    const context = await getContext();
    const groups = await getGroupController().findAll2(data, getConfig(context));

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="mb-4 text-2xl font-bold">团购</h1>
                <GroupCard {...data} {...groups} isAdmin={context.isAdmin} />
            </div>
        </div>
    );
};

export default Page;

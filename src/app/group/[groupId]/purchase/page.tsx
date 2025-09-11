import SummaryContainer from "@/app/group/[groupId]/purchase/container";
import database from "@/util/data/database";
import {notFound} from "next/navigation";

interface Props {
    params: Promise<{
        groupId: number,
    }>,
}

export const revalidate = 0;

const Page = async (props: Props) => {
    const groupId = Number((await props.params).groupId);
    const group = await database.group.findUnique({
        where: {
            id: groupId,
        },
    });
    if (!group) {
        return notFound();
    }
    return (
        <SummaryContainer data={group}/>
    );
};

export default Page;

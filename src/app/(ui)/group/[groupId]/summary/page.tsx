import SummaryContainer from "@/component/container/summary";
import {summaryItem, summaryUser, summaryWeight} from "@/util/summary";
import database from "@/util/data/database";
import {notFound} from "next/navigation";

interface Props {
    params: Promise<{
        groupId: number
    }>
}

export const revalidate = 0;

const Page = async (props: Props) => {
    const groupId = Number((await props.params).groupId)
    const group = await database.group.findUnique({
        where: {
            id: groupId
        }
    });
    if (!group) {
        return notFound();
    }
    const item = await summaryItem(groupId);
    const user = await summaryUser(groupId);
    const weight = await summaryWeight(groupId);
    return (
        <SummaryContainer group={group} item={item} user={user} weight={weight}/>
    );
}

export default Page;

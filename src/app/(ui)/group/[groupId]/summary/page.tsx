import SummaryContainer from "@/component/container/summary";
import {summaryItem, summaryUser, summaryWeight} from "@/util/summary";

interface Props {
    params: Promise<{
        groupId: number
    }>
}

export const revalidate = 0;

const Page = async (props: Props) => {
    const id = Number((await props.params).groupId);
    const item = await summaryItem(id);
    const user = await summaryUser(id);
    const weight = await summaryWeight(id);
    return (
        <SummaryContainer item={item} user={user} weight={weight}/>
    );
}

export default Page;

import OrderContainer from "@/component/container/order";
import database from "@/util/database";
import {notFound} from "next/navigation";

interface Props {
    params: Promise<{groupId: number}>
}

export const revalidate = 0;

const Page = async (props: Props) => {
    const groupId = Number((await props.params).groupId);
    const group = await database.group.findUnique({
        where: {
            id: groupId
        }
    });
    if (!group) {
        return notFound();
    }

    return (
        <OrderContainer data={group}/>
    )
}

export default Page;

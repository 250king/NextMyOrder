import JoinContainer from "@/component/container/join";
import database from "@/util/database";
import {notFound} from "next/navigation";

interface Props {
    params: Promise<{
        groupId: number,
        userId: number
    }>
}

export const revalidate = 0;

const Page = async (props: Props) => {
    const groupId = Number((await props.params).groupId);
    const userId = Number((await props.params).userId);
    const join = await database.join.findUnique({
        where: {
            userId_groupId: {
                userId: userId,
                groupId: groupId
            }
        },
        include: {
            group: true,
            user: true
        }
    })
    if (!join) {
        return notFound();
    }

    return (
        <JoinContainer data={join}/>
    )
}

export default Page;

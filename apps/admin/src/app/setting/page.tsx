import Container from "@/app/setting/container";
import {getSetting} from "@repo/util/data/setting";

export const revalidate = 0;

const Page = async () => {
    const setting = await getSetting();

    return (
        <Container data={setting}/>
    );
};

export default Page;

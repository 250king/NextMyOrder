import SettingContainer from "@/component/container/setting";
import {parse} from "@/util/data/setting";

export const revalidate = 0;

const Page = async () => {
    const setting = await parse()

    return (
        <SettingContainer data={setting}/>
    );
}

export default Page;

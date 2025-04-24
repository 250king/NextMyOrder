import {redirect, RedirectType} from "next/navigation";

const Page = () => {
    return (
        redirect("/user", RedirectType.replace)
    );
}

export default Page;

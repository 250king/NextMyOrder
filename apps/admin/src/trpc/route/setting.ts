import {procedure} from "@/trpc/server";
import {settingSchema} from "@repo/schema/setting";
import {updateSetting} from "@repo/util/data/setting";

const settingRouter = {
    settingUpdate: procedure.input(settingSchema).mutation(async ({input}) => {
        return await updateSetting(input);
    }),
};

export default settingRouter;

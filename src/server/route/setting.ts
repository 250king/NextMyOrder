import {publicProcedure, router} from "@/server/loader";
import {settingSchema} from "@/type/setting";
import {parse, update} from "@/util/setting";

const settingRouter = router({
    get: publicProcedure.query(async () => {
        return await parse()
    }),

    update: publicProcedure.input(settingSchema).mutation(async ({input}) => {
        await update(input)
    })
});

export default settingRouter;

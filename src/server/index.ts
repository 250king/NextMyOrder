import userRouter from "@/server/route/user";
import groupRouter from "@/server/route/group";
import deliveryRouter from "@/server/route/delivery";
import itemRouter from "@/server/route/item";
import orderRouter from "@/server/route/order";
import settingRouter from "@/server/route/setting";
import {router} from "@/server/loader";

const appRouter = router({
    user: userRouter,
    group: groupRouter,
    item: itemRouter,
    order: orderRouter,
    delivery: deliveryRouter,
    setting: settingRouter
})

export default appRouter;

import userRouter from "@/server/route/user";
import groupRouter from "@/server/route/group";
import listRouter from "@/server/route/list";
import itemRouter from "@/server/route/item";
import orderRouter from "@/server/route/order";
import shippingRouter from "@/server/route/shipping";
import {router} from "@/server/server";

const appRouter = router({
    ...userRouter,
    ...groupRouter,
    ...listRouter,
    ...itemRouter,
    ...orderRouter,
    ...shippingRouter,
});

export default appRouter;

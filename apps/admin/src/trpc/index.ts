import userRouter from "@/trpc/route/user";
import groupRouter from "@/trpc/route/group";
import listRouter from "@/trpc/route/list";
import itemRouter from "@/trpc/route/item";
import orderRouter from "@/trpc/route/order";
import shippingRouter from "@/trpc/route/shipping";
import deliveryRouter from "@/trpc/route/delivery";
import settingRouter from "@/trpc/route/setting";
import {router} from "@/trpc/server";
import paymentRouter from "@/trpc/route/payment";

const appRouter = router({
    ...userRouter,
    ...groupRouter,
    ...listRouter,
    ...itemRouter,
    ...orderRouter,
    ...shippingRouter,
    ...deliveryRouter,
    ...settingRouter,
    ...paymentRouter,
});

export default appRouter;

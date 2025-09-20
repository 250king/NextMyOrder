import {router} from "@/trpc/server";
import confirmRouter from "@/trpc/route/confirm";
import deliveryRouter from "@/trpc/route/delivery";

const appRouter = router({
    ...confirmRouter,
    ...deliveryRouter,
});

export default appRouter;

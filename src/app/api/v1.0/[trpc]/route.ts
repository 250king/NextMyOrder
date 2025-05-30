import {fetchRequestHandler} from "@trpc/server/adapters/fetch";
import appRouter from "@/server";
import {createContext} from "@/server/context";

const handler = (req: Request) => fetchRequestHandler({
    endpoint: "/api/v1.0",
    req,
    router: appRouter,
    createContext: createContext,
})

export {handler as GET, handler as POST};

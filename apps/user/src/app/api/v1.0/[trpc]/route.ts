import appRouter from "@/trpc";
import {fetchRequestHandler} from "@trpc/server/adapters/fetch";
import {createContext} from "@/trpc/server";

const handler = (req: Request) => fetchRequestHandler({
    endpoint: "/api/v1.0",
    req,
    router: appRouter,
    createContext: createContext,
});

export {handler as GET, handler as POST};

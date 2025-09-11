import appRouter from "@/server";
import {fetchRequestHandler} from "@trpc/server/adapters/fetch";
import {createContext} from "@/server/server";

const handler = (req: Request) => fetchRequestHandler({
    endpoint: "/api/v1.0",
    req,
    router: appRouter,
    createContext: createContext,
});

export {handler as GET, handler as POST};

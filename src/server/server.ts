import database from "@/util/data/database";
import {initTRPC} from "@trpc/server";

const t = initTRPC.context<Server>().create({
    errorFormatter({shape}) {
        if (process.env.NODE_ENV === 'production') {
            return {
                ...shape,
                message: 'Internal server error',
            };
        }
        return shape;
    },
});

export type Server = Awaited<ReturnType<typeof createContext>>;
export const router = t.router;
export const procedure = t.procedure;
export const createContext = async () => {
    return {
        db: database,
    };
};

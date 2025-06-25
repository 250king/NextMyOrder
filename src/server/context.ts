import database from "@/util/data/database";

export const createContext = async () => {
    return {database};
};

export type Context = Awaited<ReturnType<typeof createContext>>;

import database from "@/util/database";

export const createContext = async () => {
    return {database};
};

export type Context = Awaited<ReturnType<typeof createContext>>;

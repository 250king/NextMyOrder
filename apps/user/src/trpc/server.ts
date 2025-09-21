import {FetchCreateContextFnOptions} from "@trpc/server/adapters/fetch";
import {decryptJwt} from "@repo/util/security/jwt";
import {initTRPC, TRPCError} from "@trpc/server";
import database from "@repo/util/data/database";
import prisma from "@repo/util/data/database";

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
export const createContext = async (opts: FetchCreateContextFnOptions) => {
    let jwt = null;
    let user = null;
    const {req} = opts;
    const authorization = req.headers.get("authorization");
    if (authorization) {
        const list = authorization?.split(" ");
        if (list?.length === 2 && list[0] === "Bearer") {
            try {
                jwt = await decryptJwt(list[1]);
                user = await prisma.user.findUnique({
                    where: {
                        id: Number(jwt.payload.sub),
                    },
                });
            } catch (e) {
                console.error("JWT decryption failed:", e);
            }
        }
    }

    return {
        db: database,
        token: jwt,
        user: user,
    };
};

export type Server = Awaited<ReturnType<typeof createContext>>;
export const router = t.router;
export const base = t.procedure.use(async (opts) => {
    const {ctx} = opts;
    if (!ctx.user || !ctx.token) {
        throw new TRPCError({code: "UNAUTHORIZED"});
    }
    return opts.next({ctx});
});

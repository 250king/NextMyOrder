"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/service/db";
import { address } from "@/service/db/schema";
import { getContext } from "@/util/context";

export const getAddresses = async () => {
    const context = await getContext();
    return db.query.address.findMany({
        where: and(...(context.isAdmin ? [] : [eq(address.userId, context.uid!)])),
    });
};

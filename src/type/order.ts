import { z } from "zod";
import { Order } from "@/service/db/schema";
import { query } from "@/type/common";
import { ItemResult } from "@/type/item";
import { TransitResult } from "@/type/transit";
import { UserResult } from "@/type/user";

export type OrderResult = typeof Order.$inferSelect & {
    user: UserResult;
    item: ItemResult;
    transit: TransitResult | null;
}

export const orderQuery = query.extend({
    userId: z.int().positive().optional(),
})

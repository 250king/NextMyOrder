import { z } from "zod";
import { Demand } from "@/service/db/schema";

export type DemandResult = typeof Demand.$inferSelect;

export const changeDemandCountSchema = z.object({
    itemId: z.int().positive(),
    count: z.int().nonnegative(),
});

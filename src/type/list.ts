import { z } from "zod";
import { List } from "@/service/db/schema";

export type ListResult = typeof List.$inferSelect;

export const changeListCountSchema = z.object({
    itemId: z.int().positive(),
    count: z.int().nonnegative(),
});

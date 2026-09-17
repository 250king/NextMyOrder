import { z } from "zod";
import { Address } from "@/service/db/schema";
import { mainlandChinaMobileRegex } from "@/type/mobile";

export type AddressResult = typeof Address.$inferSelect;

export const addressCreateSchema = z.object({
    recipient: z.string().trim().min(1).max(64),
    phone: z.string().regex(mainlandChinaMobileRegex),
    address: z.string().trim().min(1).max(255),
});

export const addressUpdateSchema = addressCreateSchema.extend({
    id: z.int().positive(),
});

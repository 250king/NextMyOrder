import { z } from "zod";
import { Address } from "@/service/db/schema";

export type AddressResult = typeof Address.$inferSelect;

export const addressCreateSchema = z.object({
    recipient: z.string().trim().min(1).max(64),
    phone: z.string().regex(/^1[3-9]\d{9}$/),
    address: z.string().trim().min(1).max(255),
});

export const addressUpdateSchema = addressCreateSchema.extend({
    id: z.int().positive(),
});

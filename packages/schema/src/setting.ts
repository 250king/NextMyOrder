import nullable from "@repo/util/data/type";
import {z} from "zod/v4";

export const settingSchema = z.object({
    address: nullable(z.string()),
    name: nullable(z.string()),
    phone: nullable(z.string()),
    label: nullable(z.string().default("NextMyOrder")),
    cargo: nullable(z.string()),
    title: nullable(z.string().default("NextMyOrder")),
    logo: nullable(z.url()),
});

export type SettingSchema = z.infer<typeof settingSchema>;

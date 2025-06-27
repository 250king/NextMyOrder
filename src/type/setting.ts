import {object, string, infer as zInfer} from "zod";

export const settingSchema = object({
    address: string().default(""),
    name: string().default(""),
    phone: string().default(""),
    label: string().default(""),
    cargo: string().default("")
})

export type SettingSchema = zInfer<typeof settingSchema>;

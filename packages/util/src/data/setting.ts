import prisma from "./database";
import {SettingSchema} from "@repo/schema/setting";

export const getSetting = async () => {
    console.log("DATABASE_URL a nivel de servidor:", process.env.DATABASE_URL);
    return Object.fromEntries(
        await prisma.setting.findMany().then(i => i.map(
            j => [j.key, j.value],
        )),
    ) as SettingSchema;
};

export const updateSetting = async (data: SettingSchema) => {
    const entries = Object.entries(data);
    await Promise.all(entries.map(
        ([key, value]) => prisma.setting.upsert({
            where: {key},
            update: {value},
            create: {
                key: key,
                value: value as string | null,
            },
        }),
    ));
};

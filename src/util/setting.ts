import database from "@/util/database";
import {SettingSchema, settingSchema} from "@/type/setting";

export const parse = async () => {
    const raw = await database.setting.findMany();
    const result: Record<string, string> = {};
    raw.forEach(({ key, value }) => {
        result[key] = value;
    });
    return settingSchema.parse(result);
}

export const update = async (data: SettingSchema) => {
    for (const [key, value] of Object.entries(data)) {
        await database.setting.upsert({
            where: {key},
            update: {
                value: String(value)
            },
            create: {
                value: String(value),
                key
            }
        });
    }
}

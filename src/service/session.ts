import { headers } from "next/headers";
import { Redis } from "ioredis";
import { env } from "@/util/env";

let redis: Redis | undefined;

const getRedis = () => {
    redis ??= new Redis(env.REDIS_URL);
    return redis;
};

export const clear = async () => {
    const sid = (await headers()).get("x-sid");
    if (!sid) {
        return;
    }
    await getRedis().del(`${env.SESSION_PREFIX}:${sid}`);
};

export const getAll = async (id: string | null = null) => {
    const sid = (await headers()).get("x-sid") || id;
    if (!sid) {
        return {};
    }
    const raw = await getRedis().call("GETEX", `${env.SESSION_PREFIX}:${sid}`, "EX", String(env.SESSION_TTL));
    if (!raw) {
        return {};
    }
    return JSON.parse(raw as string);
};

export const setAll = async (data: Record<string, string | number | null>, id: string | null = null) => {
    const sid = (await headers()).get("x-sid") || id;
    if (!sid) {
        return;
    }
    await getRedis().set(`${env.SESSION_PREFIX}:${sid}`, JSON.stringify(data), "EX", env.SESSION_TTL);
};

export const has = async (key: string) => {
    return key in (await getAll())
}

export const get = async (key: string) => {
    return (await getAll())[key];
}

export const set = async (key: string, value: string) => {
    const data = await getAll();
    data[key] = value;
    await setAll(data);
}

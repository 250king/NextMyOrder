import { parseAbsolute } from "@internationalized/date";
import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)
dayjs.extend(timezone)

export const toUtf8 = (base64: string) => {
    return Buffer.from(base64, "base64").toString("utf-8");
}

export const currency = (amount: number, type: string) => {
    return new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: type,
    }).format(amount);
}

export const date = (current: Date | string) => {
    return dayjs.utc(current).tz("Asia/Shanghai").format("YYYY/M/D HH:mm:ss");
}

export const genReqNum = (requestId: number) => {
    const time = dayjs.utc().format("YYYYMMDDHHmmss");
    return `${time}${String(requestId).padStart(18, "0")}`;
}

export const dataValue = (current: Date | string) => {
    return parseAbsolute(dayjs(current).toISOString(), "Asia/Shanghai");
}

export const randomStr = (length: number) => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    return Array.from(values, (value) => chars[value % chars.length]).join("");
};

export const toPositiveInt = (value: unknown, fallback: number) => {
    const num = Number(value);
    return Number.isInteger(num) && num > 0 ? num : fallback;
};

export const toPagination = <T extends { page?: unknown; size?: unknown }>(query: T, defaultSize = 10, maxSize = 100) => {
    const page = toPositiveInt(query.page, 1);
    const rawSize = toPositiveInt(query.size, defaultSize);
    const size = Math.min(rawSize, maxSize);

    return {
        limit: size,
        offset: (page - 1) * size,
    };
};

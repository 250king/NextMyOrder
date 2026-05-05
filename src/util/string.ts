import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

export const toUtf8 = (base64: string) => {
    return Buffer.from(base64, "base64").toString("utf-8");
}

export const currency = (amount: number, type: string) => {
    return new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: type,
    }).format(amount);
}

export const date = (current: string) => {
    return new Date(current).toLocaleString("zh-CN");
}

export const genReqNum = (requestId: number) => {
    const time = dayjs.utc().format("YYYYMMDDHHmmss");
    return `${time}${String(requestId).padStart(18, "0")}`;
}

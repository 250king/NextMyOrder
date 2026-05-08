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

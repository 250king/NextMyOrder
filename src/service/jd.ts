import { createHash } from "crypto";
import axios, { AxiosHeaders} from "axios";
import { env } from "@/util/env";

const client = axios.create({
    baseURL: "https://openapi.duolabao.com/v1/",
});

client.interceptors.request.use((config) => {
    const method = config.method?.toUpperCase();
    if (method !== "GET" && method !== "POST") {
        return config;
    }
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const url = new URL(config.url!);
    const path = url.pathname;
    let signStr = `secretKey=${env.JD_SECRET}&timestamp=${timestamp}&path=${path}`;
    if (method === "POST") {
        const jsonBody = JSON.stringify(config.data);
        signStr += `&body=${jsonBody}`;
        config.data = jsonBody;
        config.headers = AxiosHeaders.from(config.headers);
    } else {
        config.headers = AxiosHeaders.from(config.headers);
    }
    config.headers.set("accessKey", env.JD_KEY);
    config.headers.set("timestamp", timestamp);
    config.headers.set("token", createHash("sha1").update(signStr).digest("hex").toUpperCase());
    return config;
});

export const generateUrl = async (requestNum: string, amount: string) => {
    return client.post("customer/order/payurl/create", {
        requestNum: requestNum,
        amount: amount,
        customerNum: env.JD_CUSTOMER_ID,
        shopNum: env.JD_SHOP_ID,
        callbackUrl: env.JD_CALLBACK_URL,
        source: "API"
    });
}

export const cancelOrder = async (requestNum: string) => {
    return client.post("customer/order/close", {
        requestNum: requestNum,
        customerNum: env.JD_CUSTOMER_ID,
    });
}
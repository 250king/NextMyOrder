import * as crypto from "node:crypto";
import axios from "axios";
import { z } from "zod";
import { cancelOrderSchema, createOrderSchema } from "@/type/delivery";
import { env } from "@/util/env";

const client = axios.create()

client.interceptors.request.use(async (config) => {
    if (config.data instanceof URLSearchParams) {
        const data = config.data;
        const param = data.get("param")?.toString() ?? "";
        const t = Date.now().toString();
        const key = env.KD100_KEY;
        const secret = env.KD100_SECRET;
        const sign = crypto
            .createHash("MD5")
            .update(param + t + key + secret)
            .digest("hex")
            .toUpperCase();
        data.append("t", t);
        data.append("key", key);
        data.append("sign", sign);
    }
    return config;
});

const url = `https://poll.kuaidi100.com/order/borderapi.do`;

export const createOrder = async (params: z.input<typeof createOrderSchema>) => {
    const data = createOrderSchema.parse(params);
    const payload = new URLSearchParams({
        param: JSON.stringify(data),
        method: "bOrder",
    });
    return client.post(url, payload);
};

export const cancelOrder = async (params: z.infer<typeof cancelOrderSchema>) => {
    const data = cancelOrderSchema.parse(params);
    const payload = new URLSearchParams({
        param: JSON.stringify(data),
        method: "cancel"
    });
    return client.post(url, payload);
}

import axios from "axios";
import crypto from "crypto";

const kd100 = axios.create({
    timeout: 15000,
});

kd100.interceptors.request.use(async (config) => {
    if (config.data instanceof URLSearchParams) {
        const data = config.data;
        const param = data.get("param")?.toString() ?? "";
        const t = (Math.floor(Date.now() / 1000) * 1000).toString();
        const key = process.env.EXPRESS_KEY!;
        const secret = process.env.EXPRESS_SECRET!;
        const sign = crypto.createHash("MD5")
            .update(param + t + key + secret)
            .digest("hex")
            .toUpperCase();
        data.append("t", t);
        data.append("key", key);
        data.append("sign", sign);
    }
    return config;
});

export default kd100;

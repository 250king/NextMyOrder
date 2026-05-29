import axios from "axios";
import { env } from "@/util/env";

const client = axios.create();

client.interceptors.request.use((config) => {
    const method = config.method?.toUpperCase();
    if (method == "GET") {
        config.params.key = env.AMAP_KEY
    }
    return config;
});

export const parseAddress = async (address: string) => {
    return client.get("https://restapi.amap.com/v3/geocode/geo", {
        params: {
            address,
        }
    })
}

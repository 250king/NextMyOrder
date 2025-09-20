import axios from "axios";

const napcat = axios.create({
    timeout: 15000,
    baseURL: process.env.NAPCAT_URL,
    headers: {
        Authorization: `Bearer ${process.env.NAPCAT_TOKEN}`,
    },
});

export default napcat;

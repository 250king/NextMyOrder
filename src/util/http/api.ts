import axios from "axios";

const $ = axios.create({
    baseURL: '/api/v1.0',
    timeout: 10000,
});

export default $;

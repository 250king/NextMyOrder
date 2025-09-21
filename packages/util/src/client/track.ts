import axios from "axios";

const track = axios.create({
    timeout: 15000,
    baseURL: "https://api.17track.net/track/v2.4",
    headers: {
        "17token": process.env.TRACKING_KEY,
    },
});

export default track;

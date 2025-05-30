import axios from "axios";

const common = axios.create({
    timeout: 15000
});

export default common;

import { forbidden, notFound } from "next/navigation";
import axios, { type AxiosRequestConfig } from 'axios';
import { env } from '@/util/env';

export const AXIOS_INSTANCE = axios.create({
    baseURL: env.API_URL,
});

AXIOS_INSTANCE.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error?.response?.status;
        if (status === 403) {
            forbidden();
        }
        if (status === 404) {
            notFound();
        }
        return Promise.reject(error);
    }
);

export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
    const source = axios.CancelToken.source();
    const promise = AXIOS_INSTANCE({
        ...config,
        ...options,
        cancelToken: source.token,
    }).then(({ data }) => data);
    // @ts-expect-error generated code
    promise.cancel = () => {
        source.cancel('Query was cancelled');
    };
    return promise;
};

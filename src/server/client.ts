import {createTRPCClient, httpBatchLink} from '@trpc/client';
import type appRouter from '@/server';

const trpc = createTRPCClient<typeof appRouter>({
    links: [
        httpBatchLink({
            url: '/api/v1.0', // 注意这是你后端暴露 tRPC API 的路径
        }),
    ]
});

export default trpc;

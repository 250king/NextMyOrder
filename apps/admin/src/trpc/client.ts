import type appRouter from '@/trpc';
import {createTRPCClient, httpBatchLink} from '@trpc/client';

const trpc = createTRPCClient<typeof appRouter>({
    links: [
        httpBatchLink({
            url: '/api/v1.0',
        }),
    ],
});

export default trpc;

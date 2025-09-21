import type appRouter from '@/trpc';
import {createTRPCClient, httpBatchLink} from '@trpc/client';

const trpc = createTRPCClient<typeof appRouter>({
    links: [
        httpBatchLink({
            url: '/api/v1.0',
            headers: async () => {
                const query = new URLSearchParams(window.location.search);
                return {
                    Authorization: `Bearer ${query.get('token')}`,
                };
            },
        }),
    ],
});

export default trpc;

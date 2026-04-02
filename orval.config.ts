import { defineConfig } from 'orval';

export default defineConfig({
    orderApi: {
        input: 'http://api.order.lan:8080/v3/api-docs',
        output: {
            mode: 'tags-split',
            target: 'src/api/generated',
            schemas: 'src/api/model',
            client: 'axios',
            httpClient: 'axios',
            override: {
                mutator: {
                    path: 'src/api/axios-instance.ts',
                    name: 'customInstance',
                },
            },
        },
    },
});

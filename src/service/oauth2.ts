import * as client from 'openid-client';
import { env } from '@/util/env';

let issuer: client.Configuration;

try {
    issuer = await client.discovery(new URL(env.OIDC_URI), env.CLIENT_ID, env.CLIENT_SECRET);
} catch {
    issuer = {} as client.Configuration;
}

export {issuer};

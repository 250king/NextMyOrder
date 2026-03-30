import * as client from 'openid-client';
import { env } from '@/util/env';

export const issuer = await client.discovery(new URL(env.OIDC_URI), env.CLIENT_ID, env.CLIENT_SECRET)

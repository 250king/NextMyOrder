import {NextRequest, NextResponse} from 'next/server';
import {decryptJwt} from "@repo/util/security/jwt";

export const middleware = async (req: NextRequest) => {
    const {searchParams} = req.nextUrl;
    const token = searchParams.get('token');

    if (!token) {
        return new NextResponse('Unauthorized: token is required', {status: 401});
    }

    try {
        const credential = await decryptJwt(token);
        const tokenUserId = Number(credential.payload.sub);
        const cookieUserId = Number(req.cookies.get('user_id')?.value);
        if (tokenUserId !== cookieUserId && req.nextUrl.pathname !== '/identify') {
            const callback = req.nextUrl.clone();
            const redirectUrl = new URL('/identify', req.url);
            redirectUrl.searchParams.set("token", token);
            redirectUrl.searchParams.set("callback", callback.pathname);
            const res = NextResponse.redirect(redirectUrl);
            res.cookies.set("user_id", "", {maxAge: 0});
            res.headers.set("X-User-Id", tokenUserId.toString());
            return res;
        }
        const res = NextResponse.next();
        res.headers.set("X-User-Id", tokenUserId.toString());
        res.headers.set("X-Jwt-Payload", JSON.stringify(credential.payload));
        return res;
    } catch (e) {
        console.error('JWT decryption error:', e);
        return new NextResponse('Unauthorized: invalid token', {status: 401});
    }
};

export const config = {
    matcher: ['/((?!_next|favicon.ico|api).*)'],
};

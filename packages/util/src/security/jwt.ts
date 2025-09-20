import * as jose from "jose";

export const createJWT = async (
    payload: Record<string, unknown>,
    subject: string,
    audience: string,
    expired: string = "1d",
): Promise<string> => {
    return await new jose.SignJWT(payload)
        .setProtectedHeader({
            alg: "HS256",
            typ: "JWT",
        })
        .setAudience(audience)
        .setIssuedAt()
        .setExpirationTime(expired)
        .setSubject(subject)
        .setJti(crypto.randomUUID())
        .sign(new TextEncoder().encode(process.env.APP_KEY));
};

export const decryptJwt = async (token: string) => {
    const secret = new TextEncoder().encode(process.env.APP_KEY);
    return await jose.jwtVerify(token, secret);
};

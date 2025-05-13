import {NextRequest, NextResponse} from "next/server";

export const GET = async (req: NextRequest) => {
    const params = req.nextUrl.searchParams;
    const address = decodeURIComponent(params.get("address") || "");
    const payload = new URLSearchParams({
        address,
        key: process.env.AMAP_KEY as string,
    });
    const result = await (await fetch(`https://restapi.amap.com/v3/geocode/geo?${payload.toString()}`)).json()
    if (!result.geocodes[0].city) {
        return new NextResponse(null, {status: 404});
    }
    return NextResponse.json({
        province: result.geocodes[0].province,
        city: result.geocodes[0].city,
        town: result.geocodes[0].district
    });
}

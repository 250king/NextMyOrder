import {NextRequest, NextResponse} from "next/server";

export const GET = async (req: NextRequest) => {
    const params = req.nextUrl.searchParams;
    const qq = params.get("qq");
    const result = await (await fetch(`https://jkapi.com/api/qqinfo?qq=${qq}`)).json();
    if (!result.nick) {
        return new NextResponse(null, {status: 404});
    }
    return NextResponse.json({name: result.nick});
}

import {NextRequest, NextResponse} from "next/server";
import {parseItem} from "@/util/item";

export const GET = async (req: NextRequest) => {
    const params = req.nextUrl.searchParams;
    const url = decodeURIComponent(params.get("url") || "");
    const result = await parseItem(url);
    if (!result) {
        return new NextResponse(null, {status: 404});
    }
    return NextResponse.json(result);
}

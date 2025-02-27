import { NextRequest, NextResponse } from "next/server";

export async function GET(req : NextRequest) : Promise<NextResponse> {
    return new NextResponse(
        JSON.stringify(
            {
                error : "Method Not allowed.",
                status_code : 405
            }
        )
        , {
        status: 405
    });
}
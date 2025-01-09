import { NextResponse } from "next/server"

async function POST(req) {
    const { location,city } = await req.json()
    if (location && city) {
        const response = NextResponse.json({success:true})
        response.cookies.set({
            name : "location",
            value: JSON.stringify(location)
        });
        response.cookies.set({
            name : "city",
            value: city
    })
        return response;
    } else {
        return NextResponse.json({message: "유효하지 않은 데이터입니다."},{status: 400});
    }
}

async function GET(req) {
    const cookies = await req.cookies;
    const location = cookies.get("location")
    const city = cookies.get("city")
    return NextResponse.json({
        location,
        city
    })

}


export {POST,GET}
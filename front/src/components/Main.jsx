"use client"

import { useRef, useState } from "react"
import Map from "./Map/Map";

export default function Main() {

    const [location,setLocation] = useState(null);
    const btnRef = useRef();

    const onChangeLocation = (e) => {
        const lat = e.target.dataset.lat;
        console.log(lat);
    }

    console.log(location);

    return (
        <>
            <div>메인 페이지 입니다.</div>
            <div>
                <button data-lat="35.6895" data-lng="139.6917" onClick={onChangeLocation}>도쿄</button>
                <button value={{lat: 37.5665, lng: 126.9780}} onClick={onChangeLocation}>서울</button>
                <button value={{lat: 40.7128, lng: -74.0060}} onClick={onChangeLocation}>뉴욕</button>
            </div>
            {location && <Map Location={location} />}
        </>
    )
}
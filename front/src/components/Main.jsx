"use client"

import { useRef, useState } from "react"
import MapComponents from "./Map/MapComponent";


export default function Main() {

    const [location,setLocation] = useState(null);

    const onChangeLocation = (e) => {
        const lat = Number(e.target.dataset.lat);
        const lng = Number(e.target.dataset.lng);
        setLocation({lat: lat, lng: lng});
    }

    console.log(location);

    return (
        <>
            <div>메인 페이지 입니다.</div>
            <div>
                <button data-lat="35.6895" data-lng="139.6917" onClick={onChangeLocation}>도쿄</button>
                <button data-lat="37.5665" data-lng="126.9780" onClick={onChangeLocation}>서울</button>
                <button data-lat="40.7128" data-lng="-74.0060" onClick={onChangeLocation}>뉴욕</button> 
            </div>
            {location && <MapComponents location={location} />}
        </>
    )
}
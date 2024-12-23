"use client"

import { useRef, useState } from "react"
import MapComponents from "./Map/MapComponent";


export default function Main() {

    const [location,setLocation] = useState(null);
    const [isLoading,setIsLoading] = useState(false);
    const [mapKey,setMapKey] =  useState(0);
    const [selLocation,setSelLocation] = useState([]);
    const [city, setCity] = useState(null);
    const selInputRef = useRef([]);

    const onChangeLocation = (e) => {
        const lat = Number(e.target.dataset.lat);
        const lng = Number(e.target.dataset.lng);
        setLocation({lat: lat, lng: lng});
        setCity(e.target.innerText);
        setIsLoading(false);
        // 좌표 이동시 지도 재실행 => 키값을 바꿔서 다시 실행
        setMapKey(prevNum => prevNum+1);
        setSelLocation([]);
        selInputRef.current.map(item => item.checked = false);
    }

    return (
        <>
            <div>메인 페이지 입니다.</div>
            <div>
                <button data-lat="35.6895" data-lng="139.6917" onClick={onChangeLocation}>도쿄</button>
                <button data-lat="37.5665" data-lng="126.9780" onClick={onChangeLocation}>서울</button>
                <button data-lat="40.7128" data-lng="-74.0060" onClick={onChangeLocation}>뉴욕</button> 
            </div>
            {location && <MapComponents 
                city = {city}
                location = {location} 
                isLoading = {isLoading}
                setIsLoading = {setIsLoading}
                mapKey = {mapKey}
                selLocation = {selLocation}
                setSelLocation = {setSelLocation}
                selInputRef={selInputRef}
                />}
        </>
    )
}
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";

export default function Main() {

    const router = useRouter();

    const [location,setLocation] = useState(null);
    const [city, setCity] = useState(null);

    useEffect(()=> {
        if(location) {
            console.log(location)
            router.push("/schedule");
        }
    },[location])

    const onChangeLocation = (e) => {
        const lat = Number(e.target.dataset.lat);
        const lng = Number(e.target.dataset.lng);
        setLocation({lat: lat, lng: lng});
        setCity(e.target.innerText);

        router.push('/schedule')
    }

    return (
        <>
            <div>메인 페이지 입니다.</div>
            <div>
                <button data-lat="35.6895" data-lng="139.6917" onClick={onChangeLocation}>도쿄</button>
                <button data-lat="37.5665" data-lng="126.9780" onClick={onChangeLocation}>서울</button>
                <button data-lat="40.7128" data-lng="-74.0060" onClick={onChangeLocation}>뉴욕</button> 
                <button data-lat="35.151001" data-lng="126.925393" onClick={onChangeLocation}>동명동</button> 
            </div>

        </>
    )
}
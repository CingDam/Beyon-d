"use client"

import { Status, Wrapper } from "@googlemaps/react-wrapper"

export default function Main() {
    
    const render = () => {
        switch(Status) {
            case Status.LOADING:
                return <>Loading...</>
            case Status.FAILURE:
                return <>Error!</>
            case Status.SUCCESS:
                return <>Loading Successfully!</>
        }
    }
    return (
        <>
            <div>메인 페이지 입니다.</div>
            <Wrapper
                apiKey="AIzaSyDY4kZ-eJurK-Uv1sO-IXdpizQywV38ezs"
                render={render}
            ></Wrapper>
        </>
    )
}
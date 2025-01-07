"use client"

import { AdvancedMarker, AdvancedMarkerAnchorPoint, APIProvider, ControlPosition, Map, MapControl, Pin } from "@vis.gl/react-google-maps";
import { useContext,useEffect,useState } from "react";
import MapStyle from "@/styles/map.module.css"
import ScheduleList from "./ScheduleList";
import { MapContext } from "@/context/MapContext";
import { useRouter } from "next/navigation";

const MapComponents = () => {
    const router = useRouter();
    const libs = ["places","marker"];
    const mapId = "ed3bd3a47cfd4697";
    const apiKey = "AIzaSyDY4kZ-eJurK-Uv1sO-IXdpizQywV38ezs";
    const containerStyle = {
      width: "100%",
      height: "auto",
    };

    const [location,setLocation] = useState(null);
    const [city,setCity] = useState(null);
    const [mapInfo,setMapInfo] = useState(null);
    const [select, setSelect] = useState(null);
    const [searchKeyword, setSerachKeyword] = useState("인기있는 장소들");
    const [results,setResults] = useState([]);
    const [resetSearch,setResetSearch] = useState(false);
    const [dragOn,setDragOn] = useState(false);
    const [isLoading,setIsLoading] = useState(false);
    const [selLocation,setSelLocation] = useState([]);

    useEffect(()=> {
      fetch("/api/to-schedule")
      .then(res => {
        if(!res.ok) {
          console.error("데이터 불러오기 실패!")
          router.back()
        }
        return res.json()
      }).then(data => {
        console.log(data)
        if(data) {
          setLocation(JSON.parse(data.location.value));
          setCity(data.city.value);
        }
      })
    },[])

    const handleMapLoad = (map) => {
      console.log("로딩완료");
      const selMap = map.map;
      if(!isLoading) {
        setResults([]);
        setSelLocation([]);
        setIsLoading(true);
        setDragOn(false);
        setSelect("인기있는 장소들");
        setSerachKeyword("인기있는 장소들");
      }
      setResetSearch(true); 
      setMapInfo(selMap);
    }

  return (
    <div className={MapStyle.container}>
        <MapContext.Provider value={{selLocation,setSelLocation}}>
            <ScheduleList mapInfo={mapInfo}
            select={select}
            setSelect = {setSelect}
            searchKeyword={searchKeyword}
            setSerachKeyword={setSerachKeyword}
            results={results}
            setResults={setResults}
            resetSearch={resetSearch}
            setResetSearch={setResetSearch}
            dragOn={dragOn}
            setDragOn={setDragOn}
            location={location}
            city={city}
            />
              <APIProvider apiKey={apiKey} libraries={libs}>
                 {
                  location &&  <Map
                    onTilesLoaded={handleMapLoad}
                    mapId={mapId}
                    style={containerStyle}
                    defaultZoom={12}
                    defaultCenter={location}
                    gestureHandling="auto"
                    options={{ draggable: true }}
                    scrollwheel={true}
                    onRenderingTypeChanged={"vector"}
                    disableDefaultUI
                  >
                  {
                    selLocation.length > 0 && 
                    selLocation?.map((location,index) => (
                      <AdvancedMarker key={index} position={location}
                        anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}>
                        <Pin background={'#fa383e'} glyphColor={'#fff'} borderColor={'#9e262a'} >
                          <div>{index+1}</div>
                        </Pin>
                      </AdvancedMarker>
                    ))
                  }
                  </Map> 
                 }
              </APIProvider>
          </MapContext.Provider>
    </div>
  )
}

export default MapComponents
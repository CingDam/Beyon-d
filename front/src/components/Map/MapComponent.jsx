
import { AdvancedMarker, AdvancedMarkerAnchorPoint, APIProvider, ControlPosition, Map, MapControl, Pin } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import MapStyle from "@/styles/map.module.css"

const MapComponents = ({location, 
    city, 
    mapKey, 
    isLoading, 
    setIsLoading, 
    selLocation, 
    setSelLocation, 
    selInputRef}) => {

    const [mapInfo,setMapInfo] = useState(null);
    const [results,setResults] = useState(null);



    const libs = ["places","marker"];
    const mapId = "ed3bd3a47cfd4697";
    const apiKey = "AIzaSyDY4kZ-eJurK-Uv1sO-IXdpizQywV38ezs";
        
    const containerStyle = {
      width: "100%",
      height: "100vh",
    };


    useEffect(() => {
      // 주변검색
      if(mapInfo) {
        const service = new window.google.maps.places.PlacesService(mapInfo);

        const request = {
          location: new window.google.maps.LatLng(location.lat,location.lng),
          radius: 10000,
          keyword : `(${city} 여행명소) OR (${city} 観光地)`,
          types: ['tourist_attraction','establishment'],
        }
        service.nearbySearch(request, (results, stauts) => {
          if(stauts === window.google.maps.places.PlacesServiceStatus.OK) {
            console.log(results);
            setResults(results);
          }
        });
      }
    },[mapInfo])


    useEffect(() => {
      if (mapInfo && selLocation.length > 1) {
        const polyline = new window.google.maps.Polyline({
          path: selLocation, // 선택된 위치 배열
          geodesic: true,
          strokeColor: "#000", // 선 색상
          strokeOpacity: 0,
          strokeWeight: 2,
          icons: [
             { icon: {
                path: "M 0,-1 0,1", // 점선 모양 (직선 형태 반복)
                strokeColor:"#323232",
                strokeOpacity: 0.5,
                scale: 2, // 점선 크기
             },
              offset: "0",
              repeat: "10px"
            }]
        });
    
        polyline.setMap(mapInfo); // 지도에 추가
        return () => polyline.setMap(null); // cleanup
      }
    }, [mapInfo, selLocation]);

    const handleMapLoad = (map) => {
      console.log("로딩완료");
      const selMap = map.map;
      if(!isLoading) {
        setIsLoading(true);
      }
      setMapInfo(selMap);
    }

    const handelSelLocation = (index, isChecked) => {
      const selVal = JSON.parse(selInputRef.current[index].value);
      setSelLocation(prev => {
        if (isChecked) {
          // 체크된 경우: 값 추가 (중복 방지)
          // Array.some(): 조건에 부합하면 배열추가
          const exists = prev.some(
            (item) => item.lat === selVal.lat && item.lng === selVal.lng
          );
          if (!exists) {
            return [...prev, selVal];
          }
          return prev; // 이미 존재하면 추가하지 않음
        } else {
          // 체크 해제된 경우: 값 제거
          return prev.filter(
            (item) => item.lat !== selVal.lat || item.lng !== selVal.lng
          );
        }
      });

    }

  return (
    <div className={MapStyle.container}>
        <div className={MapStyle.search}>
          {results?.map((result,index) => <div key={index}>
            <p>{index+1}.</p>
            <div>
              <img src={`${result.photos[0].getUrl({ maxWidth: 300, maxHeight: 300 })}`}></img>
            </div>
            <div>
              <p>{result.name}</p>
              <p>{result.vicinity}</p>
            </div>
            <div>
              <input type="checkbox"
                defaultValue={JSON.stringify({
                lat:result.geometry.location.lat(),
                lng:result.geometry.location.lng()
                })}
                defaultChecked={false}
                onChange={(e) => handelSelLocation(index,e.target.checked)}
                ref={el => selInputRef.current[index] = el}
              />
            </div>
          </div>)}
        </div>
        <APIProvider apiKey={apiKey} libraries={libs}>
            <Map
              key={mapKey}
              onTilesLoaded={handleMapLoad}
              mapId={mapId}
              style={containerStyle}
              defaultZoom={12}
              defaultCenter={location}
              gestureHandling="auto"
              options={{ draggable: true }}
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
        </APIProvider>
    </div>
  )
}

export default MapComponents
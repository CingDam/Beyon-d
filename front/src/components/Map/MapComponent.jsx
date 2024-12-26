
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
    const [results,setResults] = useState([]);
    const [selectList, setSelectList] = useState([]);



    const libs = ["places","marker"];
    const mapId = "ed3bd3a47cfd4697";
    const apiKey = "AIzaSyDY4kZ-eJurK-Uv1sO-IXdpizQywV38ezs";
        
    const containerStyle = {
      width: "100%",
      height: "auto",
    };

    useEffect(()=>{
      setSelectList(selLocation.map(location => location.item))}
      ,[selLocation])

    // 주변검색 => 지도가 로드된 후
    useEffect(() => {
      if(mapInfo) {
        const service = new window.google.maps.places.PlacesService(mapInfo);

        const request = {
          location: new window.google.maps.LatLng(location.lat,location.lng),
          radius: 10000,
          keyword : `(${city} 여행명소)`,
          types: ['tourist_attraction','establishment'],
        }
        service.nearbySearch(request, ( result, stauts, pageToken ) => {
          if(stauts === window.google.maps.places.PlacesServiceStatus.OK) {
            result = result.map(item =>( {...item, status:false}))
            result.map(item => setResults(prev => [...prev, item]))
            pageToken.nextPage();
          }
        });
      }
    },[mapInfo])

    // 마커 생성시 줄
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

    const formatIndex = (value) => {
      return String(value).padStart(2,"0");
    }

    const handleMapLoad = (map) => {
      console.log("로딩완료");
      const selMap = map.map;
      if(!isLoading) {
        setIsLoading(true);
        setResults([]);
      }
      setMapInfo(selMap);
    }


    // 가고싶은곳 선택시 배열에 추가
    const handelSelLocation = (index , lat, lng, item) => {
      console.log("받은 인덱스 값:",index)
      item["status"] = true;
      const selVal = {num: index+1, lat:lat, lng:lng, item: item};
      setSelLocation(prev => [...prev,selVal]);
    }

    const DelSelLocation = (index) => {
      setSelLocation(prev => prev.filter(item => item.num !== (index+1)));
      console.log(selLocation);
    }

  return (
    <div className={MapStyle.container}>
      <div>
        <p className={MapStyle.subtitle}>추천 관광지</p>
          <div className={MapStyle.search}>
            {results?.map((result,index) => <div key={index}>
              <div>
              <div>
                <p className={MapStyle.text}>{formatIndex(index+1)}</p>
              </div>
                <div>
                  <img src={result.photos ? result.photos[0].getUrl({ maxWidth: 300, maxHeight: 300 }) : null}></img>
                </div>
                <div>
                  <p className={MapStyle.text}>{result.name}</p>
                  <p>{result.vicinity}</p>
                </div>
              </div>
              <div>
                <button onClick={()=> handelSelLocation(
                  index,
                  result.geometry.location.lat(),
                  result.geometry.location.lng(),
                  result
                )}>{result.status ? "선택됨":"추가"}</button>
              </div>
            </div>)}
          </div>
      </div>
        <div>
          <p className={MapStyle.subtitle}>선택 목록</p>
          <div className={MapStyle.selectBox}>
            {selLocation && <>
                  {
                    selectList.map((location,index) => (
                      <div key={index}>
                        <div>
                          <p className={MapStyle.text}>{formatIndex(index+1)}</p>
                        </div>
                        <div>
                          <img src={location.photos ? location.photos[0].getUrl({ maxWidth: 300, maxHeight: 300 }) : null}></img>
                        </div>
                        <div>
                          <p className={MapStyle.text}>{location.name}</p>
                          <p>{location.vicinity}</p>
                        </div>
                        <div>
                          <button onClick={()=> DelSelLocation(index)}>삭제</button>
                        </div>
                      </div>
                    ))
                  }
                </>
              }
            </div>
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
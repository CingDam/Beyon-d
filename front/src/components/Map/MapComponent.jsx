
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
    const [resetSearch,setResetSearch] = useState(false);
    const [results,setResults] = useState([]);
    const [selectList, setSelectList] = useState([]);
    const [dragIndex,setDragIndex] = useState(null);
    const [dragOn,setDragOn] = useState(false);
    const [searchKeyword, setSerachKeyword] = useState("인기있는 장소들")



    const libs = ["places","marker"];
    const mapId = "ed3bd3a47cfd4697";
    const apiKey = "AIzaSyDY4kZ-eJurK-Uv1sO-IXdpizQywV38ezs";
        
    const containerStyle = {
      width: "100%",
      height: "auto",
    };

    useEffect(()=>{
      console.log("배열 변경")
      setSelectList(selLocation.map(location => ({num: location.num,item: location.item })))}
      ,[selLocation])

    // 주변검색 => 지도가 로드된 후
    useEffect(() => {
      if(mapInfo) {
        console.log(searchKeyword)
        let isCancelled = false;
        const service = new window.google.maps.places.PlacesService(mapInfo);

        // 사각 구역 값 받아오기
        const {Gh,ei} = mapInfo.getBounds();

        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(Gh.lo,Gh.hi),
          new google.maps.LatLng(ei.lo,ei.lo)
        )

        const request = {
          bounds: bounds,
          query:`${city}의 ${searchKeyword}`,
          rankby: 'prominence',
        }

          const selLocationNames = selectList.map(item => item.item.name)

          if (!isCancelled) {
            service.textSearch(request, (result, status, pageToken) => {
              if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log(result);
                const filteredResults = result
                  .filter(
                    item =>
                      item.photos &&
                      item.business_status &&
                      item.business_status !== 'CLOSED_TEMPORARILY'
                  )
                  .map(item => ({
                    ...item,
                    selStatus: selLocationNames.includes(item.name),
                  }));
      
                // 상태 업데이트를 한 번에 처리
                setResults(prev => {
                  const newResults = filteredResults.filter(
                    newItem => !prev.some(prevItem => prevItem.name === newItem.name)
                  );
                  return [...prev, ...newResults];
                });
      
                // 다음 페이지 처리
                if (pageToken && pageToken.nextPage) {
                  setTimeout(() => {
                    if (!isCancelled) {
                      pageToken.nextPage();
                    }
                  }, 2000);
                }
              }
            });
          }
      



          return () => {
            console.log("초기화")
            isCancelled = true;
          }
      }
    },[mapInfo,searchKeyword,resetSearch])

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


    // 인덱스 번호 2자리로
    const formatIndex = (value) => {
      return String(value).padStart(2,"0");
    }

    const handleMapLoad = (map) => {
      console.log("로딩완료");
      const selMap = map.map;
      if(!isLoading) {
        setIsLoading(true);
        setDragOn(false);
        setSerachKeyword("인기있는 장소들");
      }
      setResetSearch(true); 

      setMapInfo(selMap);
    }


    // 장소 변경
    const changeKeyword = (keyword) => {
      setResults([]);
      setResetSearch(false); // 먼저 초기화
      setTimeout(() => {
        setResetSearch(true); // 일정 시간 후 검색 트리거
      }, 100); // 딜레이를 추가하여 상태 변경을 안정적으로 적용
      setSerachKeyword(keyword);
      console.log(searchKeyword)
    }

    // 가고싶은 곳 선택시 배열에 추가
    const handelSelLocation = (index , lat, lng, item) => {

      // 선택 status가 false면 추가 아니면 제거
      if(item.selStatus === false) {
        item.selStatus = true;
        const selVal = {num: index+1, lat:lat, lng:lng, item: item};
        setSelLocation(prev => [...prev,selVal]);
      } else {
        setSelLocation(prev => prev.filter(item => item.num !== (index+1)));
        results[index].selStatus = false;
      }

    }

    // 삭제 버튼 누르면 선택 목록 제거
    const DelSelLocation = (num) => {
      console.log(num)
      setSelLocation(
        prev => 
          prev.filter(
            item => {
              if( (item.num === num) && (results[num-1].name !== item.name)) {
                results[num-1].selStatus = false;
                return true;
              }
            }));

      console.log
    }

    // 드래그 시작 (인덱스 번호 저장) 
    const dragStart = (index) => {
      setDragIndex(index);
    }

    // 드래그 오버
    const dragOver = (e,index) => {
      e.preventDefault()
    }

    // 드래그 끝
    const dragEnd = (index) => {
      if(dragIndex !== index) {
        // 배열 불변성 효과 때문에 새 배열을에 기존값 넣어서 업데이트
        const updateList = [...selLocation];
        const changeVal = selLocation[index];
        updateList[index] = updateList[dragIndex];
        updateList[dragIndex] = changeVal;
        setSelLocation(updateList);
      }
    }

  return (
    <div className={MapStyle.container}>
      <div>
        <p className={MapStyle.subtitle}>추천 여행지</p>
        <div>
          <button onClick={() => changeKeyword("인기있는 장소들")}>추천 장소</button>
          <button onClick={() => changeKeyword("관광 명소")}>명소</button>
          <button onClick={() => changeKeyword("맛집")}>맛집</button>
          <button onClick={() => changeKeyword("인기 카페")}>카페</button>
          <button onClick={() => changeKeyword("인기 디저트 점")}>디저트</button>
        </div>
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
                  <p className={MapStyle.address}>{result.formatted_address.substring(0,20)}...</p>
                  <p>{result.types[0]}</p>
                </div>
              </div>
                <button onClick={() => handelSelLocation(
                  index,
                  result.geometry.location.lat(),
                  result.geometry.location.lng(),
                  result
                )}>{result.selStatus ? "선택됨":"추가"}</button>
            </div>)}
          </div>
      </div>
      
        <div>
          <p className={MapStyle.subtitle}>선택 목록</p>
          <div><button onClick = {() => dragOn ? setDragOn(false) : setDragOn(true)}>{dragOn ? "수정완료" : "수정하기"}</button></div>
          <div className={MapStyle.selectBox}>
            {selLocation && <>
                  {
                    selectList.map((location,index) => (
                      <div key={index} draggable={dragOn}
                            onDragStart={() => dragStart(index)} 
                            onDragOver={(e) => dragOver(e,index)}
                            onDrop={() => dragEnd(index)}>
                        <div>
                          <p className={MapStyle.text}>{formatIndex(index+1)}</p>
                        </div>
                        <div>
                          <img draggable={dragOn} src={location.item.photos ? location.item.photos[0].getUrl({ maxWidth: 300, maxHeight: 300 }) : null}></img>
                        </div>
                        <div>
                          <p className={MapStyle.text}>{location.item.name}</p>
                          <p>{location.item.formatted_address.substring(0,16)}...</p>
                          <p>{location.item.types[0]}</p>
                        </div>
                        <button onClick={()=> DelSelLocation(location.num)}>삭제</button>
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
        </APIProvider>
    </div>
  )
}

export default MapComponents
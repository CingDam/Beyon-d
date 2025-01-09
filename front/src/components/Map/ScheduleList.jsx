import { MapContext } from '@/context/MapContext';
import { ArrowBackIosNewRounded, ArrowForwardIosRounded, DeleteOutline, Search } from '@mui/icons-material';
import React, { useContext, useEffect, useRef, useState } from 'react'
import MapStyle from "@/styles/map.module.css"

const ScheduleList = ({mapInfo,
    select,
    setSelect,
    searchKeyword,
    setSerachKeyword,
    results,
    setResults,
    resetSearch,
    setResetSearch,
    dragOn,setDragOn,
    city}) => {
    
    const [selectList, setSelectList] = useState([]);
    const [dragIndex,setDragIndex] = useState(null);
    const {selLocation, setSelLocation} = useContext(MapContext);
    const [folded,setFolded] = useState(false);
    const [token, setToken] = useState(null);
    const [next,setNext] = useState(false);
    const [transEnd, setTransEnd] = useState(false);

    const searchRef = useRef();
    
    const createResult = (searchKeyword) => {
      let isCancelled = false;
      const service = new window.google.maps.places.PlacesService(mapInfo);

        // 사각 구역 값 받아오기
        const {Hh,ei} = mapInfo.getBounds();

        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(Hh.lo,Hh.hi),
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
                      item.business_status !== 'CLOSED_TEMPORARILY' &&
                      !item.types.includes("travel_agency","train_station")
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
                    if (!isCancelled) {
                      setToken(pageToken);
                    }
                }
              }
            });
          }

          return () => {
            console.log("초기화")
            setResults([]);
            isCancelled = true;
          }
    }

    useEffect(()=>{
      console.log(city)
      setSelectList(selLocation.map(location => ({num: location.num,item: location.item })))}
      ,[selLocation])

    // 주변검색 => 지도가 로드된 후
    useEffect(() => {
      if(mapInfo) {
        createResult(searchKeyword);
      }
    },[mapInfo,searchKeyword,resetSearch])

    // 더보기 버튼
    useEffect (()=> {
      if(next && token) {
        console.log("더보기 불러오기")
        console.log(token);
        token.nextPage();
        if(token.hasNextPage) {
          setNext(false)
        }
      }
    },[next])

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

    // 장소 변경
    const changeKeyword = (keyword) => {
      setResults([]);
      setNext(false);
      setResetSearch(false); // 먼저 초기화
      setTimeout(() => {
        setResetSearch(true); // 일정 시간 후 검색 트리거
      }, 100); // 딜레이를 추가하여 상태 변경을 안정적으로 적용
      setSelect(keyword);
      setSerachKeyword(keyword);
      console.log(searchKeyword)
    }

    // 가고싶은 곳 선택시 배열에 추가
    const handelSelLocation = (index , lat, lng, item) => {
      console.log(item)

      // 선택 status가 false면 추가 아니면 제거
      if(item.selStatus === false) {
        item.selStatus = true;
        const selVal = {num: index+1, lat:lat, lng:lng, item: item};
        setSelLocation(prev => [...prev,selVal]);
      } else {
        setSelLocation(prev => 
          prev.filter(duplicateItem => 
            {
              results.filter(result => {
                if (result.name === item.name) {
                  console.log(result.name)
                  if (result.selStatus) {
                   return result.selStatus = false;
                  }
                } 
              });
              return duplicateItem?.item.name !== item.name
            }));
      }

    }

    // 삭제 버튼 누르면 선택 목록 제거
    const DelSelLocation = (index) => {
      results.filter(result => {
        if (result.name === selLocation[index].item.name) {
          console.log(result)
          if (result.selStatus) {
            result.selStatus = false;
          }
        } 
      });

      setSelLocation(selLocation.filter(item => item.item.name !== selLocation[index].item.name));
      console.log(selLocation)

    }
    // 드래그 기능
    // 드래그 시작 (인덱스 번호 저장) 
    const dragStart = (index) => {
      setDragIndex(index);
    }

    // 드래그 오버
    const dragOver = (e) => {
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


    // 검색
    const findPlace = () => {
      const searchKeyword = searchRef.current.value;
      if (searchKeyword !== '') {
        setSelect(null);
        setResults([]);
        setSerachKeyword(searchKeyword);
        createResult(searchKeyword);
      } else {
        alert("검색어를 입력해주세요!");
        searchRef.current.focus();
      }
    }

    const getNextItem = () => {
      setNext(true);
    }

  return (
    <>
      <div className={MapStyle.resultContainer}>
        <p className={MapStyle.subtitle}>추천 여행지</p>
        <div className={MapStyle.searchBar}>
            <input 
            type="text" 
            placeholder="가고싶은곳을 적어보세요"
            onKeyDown={e => {
                if(e.key === "Enter") {
                findPlace()
                }
            }}
            ref={searchRef}/>
            <button onClick={findPlace}>
            <Search></Search>
            </button>
        </div>
        <div className={MapStyle.cate}>
            <button
            className={select === "인기있는 장소들" ? MapStyle.select : ''}
            onClick={() => changeKeyword("인기있는 장소들")}>추천 장소</button>
            <button
            className={select === "관광 명소" ? MapStyle.select : ''}
            onClick={() => changeKeyword("관광 명소")}>명소</button>
            <button
            className={select === "맛집" ? MapStyle.select : ''}
            onClick={() => changeKeyword("맛집")}>맛집</button>
            <button 
            className={select === "인기 카페"? MapStyle.select : ''}
            onClick={() => changeKeyword("인기 카페")}>카페</button>
            <button 
            className={select === "인기 디저트 점" ? MapStyle.select : ''}
            onClick={() => changeKeyword("인기 디저트 점")}>디저트</button>
        </div>
        <div className={MapStyle.search}>
          {results?.map((result,index) => <div key={index}>
              <div>
              <div>
                  <img src={result.photos ? result.photos[0].getUrl({ maxWidth: 300, maxHeight: 300 }) : null}></img>
              </div>
              <div>
                  <p className={MapStyle.text}>{result.name}</p>
                  <p className={MapStyle.address}>{result.formatted_address.substring(0,23)}...</p>
                  <p>{result.types[0]}</p>
              </div>
              </div>
              <button className={result.selStatus ? MapStyle.select: ''} onClick={() => handelSelLocation(
                  index,
                  result.geometry.location.lat(),
                  result.geometry.location.lng(),
                  result
              )}>{result.selStatus ? "선택됨":"추가"}</button>
          </div>)}
           {next ? <></> :<button onClick = {getNextItem}>더보기</button>}
        </div>

      </div>
      <div className={`${MapStyle.selectContainer} ${folded ? MapStyle.folded : MapStyle.expended}`}
        onTransitionEnd={()=> {
          if(transEnd) {
            setTransEnd(false)
          } else {
            setTransEnd(true)
          }

          console.log(transEnd)
        }}
        
      >
          <div className={MapStyle.subtitleContainer} style={{display : transEnd ? 'none' : ''}}>
            <span className={MapStyle.subtitle}>선택 목록</span>
              <button
              className={dragOn ? MapStyle.select:''}
              onClick = {() => dragOn ? setDragOn(false) : setDragOn(true)}>
              {dragOn ? "수정완료" : "수정하기"}
              </button>
           </div>
            <div className={MapStyle.selectBox} style={{
              display : transEnd ? 'none' : ''}}>
            {selLocation && <>
                    {
                    selectList.map((location,index) => (
                        <div key={index} draggable={dragOn}
                            onDragStart={() => dragStart(index)} 
                            onDragOver={(e) => dragOver(e,index)}
                            onDrop={() => dragEnd(index)}
                            >
                        <div>
                            <p className={MapStyle.text}>{formatIndex(index+1)}</p>
                        </div>
                        <div>
                            <img draggable={dragOn} src={location.item.photos ? location.item.photos[0].getUrl({ maxWidth: 300, maxHeight: 300 }) : null}></img>
                        </div>
                        <div>
                            <p className={MapStyle.text}>{location.item.name}</p>
                            <p className={MapStyle.address}>{location.item.formatted_address.substring(0,)}...</p>
                            <p>{location.item.types[0]}</p>
                        </div>
                        <button onClick={()=> DelSelLocation(index)}>
                            <DeleteOutline></DeleteOutline>
                        </button>
                        </div>
                    ))
                    }
                </>
                }
        </div>
      </div>
      <div className={`${MapStyle.foldBtn} ${folded ? MapStyle.foldedBtn: MapStyle.expendedBtn}`}
        onClick = {() => (folded ? setFolded(false) : setFolded(true))}
      >
          {folded ? <ArrowForwardIosRounded/> : <ArrowBackIosNewRounded/>}
      </div>
    </>
  )
}

export default ScheduleList
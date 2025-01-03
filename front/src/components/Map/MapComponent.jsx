
import { AdvancedMarker, AdvancedMarkerAnchorPoint, APIProvider, ControlPosition, Map, MapControl, Pin } from "@vis.gl/react-google-maps";
import { useContext,useState } from "react";
import MapStyle from "@/styles/map.module.css"
import ScheduleList from "./ScheduleList";
import { MapContext } from "@/context/MapContext";

const MapComponents = () => {
    const { location,  mapKey, isLoading, setIsLoading, selLocation, setSelLocation} = useContext(MapContext)
    const libs = ["places","marker"];
    const mapId = "ed3bd3a47cfd4697";
    const apiKey = "AIzaSyDY4kZ-eJurK-Uv1sO-IXdpizQywV38ezs";
        
    const containerStyle = {
      width: "100%",
      height: "auto",
    };

    const [mapInfo,setMapInfo] = useState(null);
    const [select, setSelect] = useState(null);
    const [searchKeyword, setSerachKeyword] = useState("인기있는 장소들");
    const [results,setResults] = useState([]);
    const [resetSearch,setResetSearch] = useState(false);
    const [dragOn,setDragOn] = useState(false);

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

        <ScheduleList mapInfo={mapInfo}
        select={select}
        searchKeyword={searchKeyword}
        results={results}
        setResults={setResults}
        resetSearch={resetSearch}
        setResetSearch={setResetSearch}
        dragOn={dragOn}
        setDragOn={setDragOn}></ScheduleList>
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
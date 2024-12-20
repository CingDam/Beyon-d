
import { AdvancedMarker, AdvancedMarkerAnchorPoint, APIProvider, Map, Pin } from "@vis.gl/react-google-maps";
import { useState } from "react";
import PlacesAutocomplete from "react-places-autocomplete";

const MapComponents = ({location}) => {

    const [address,setAddress] = useState(null);
    const [isLoading,setIsLoading] = useState(false);

    const libs = ["places","marker"]
    const mapId = "ed3bd3a47cfd4697"

    const apiKey = "AIzaSyDY4kZ-eJurK-Uv1sO-IXdpizQywV38ezs"
    const containerStyle = {
        width: "100%",
        height: "100vh",
      };

    const handleSelect = (add) => {
        console.log(add);
        setAddress(add);
    }

    const handleMapLoad = () => {
      console.log("로딩완료")
      set
    }

  return (
    <div>
        <APIProvider apiKey={apiKey} libraries={libs}>
            <Map
              onTilesLoaded={handleMapLoad} 
              mapId={mapId}
              style={containerStyle}
              defaultZoom={14}
              defaultCenter={location}
              gestureHandling="auto"
              options={{ draggable: true }}
              disableDefaultUI
            >
              <AdvancedMarker position={location}
              anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}>
                <Pin background={'#fa383e'} glyphColor={'#9e262a'} borderColor={'#9e262a'} />
              </AdvancedMarker>
              <PlacesAutocomplete 
                value={location}
                onChange={setAddress}
                onSelect={handleSelect}
              >
                {({suggestions}) => {
                  {suggestions.map(suggestion => (<div>{suggestion}</div>))}
                }}
            </PlacesAutocomplete>
            </Map>
          </APIProvider>
    </div>
  )
}

export default MapComponents
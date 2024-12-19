import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"

const Map = ({Location}) => {
    const apiKey = "AIzaSyDY4kZ-eJurK-Uv1sO-IXdpizQywV38ezs"
    const containerStyle = {
        width: "100%",
        height: "100vh",
      };
  return (
    <div>
        <LoadScript googleMapsApiKey={apiKey}>
            <GoogleMap
                 mapContainerStyle={containerStyle}
                 center={Location}
                 zoom={14}
            >
                <Marker position={Location} />
            </GoogleMap>
        </LoadScript>
    </div>
  )
}

export default Map
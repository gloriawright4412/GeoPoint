import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crosshair } from "lucide-react";
import { LocationData } from "@shared/schema";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationMapProps {
  currentLocation?: LocationData;
  isLoading: boolean;
  onGetLocation: () => void;
}

export default function LocationMap({ currentLocation, isLoading, onGetLocation }: LocationMapProps) {
  const defaultCenter: [number, number] = [40.7128, -74.0060]; // New York as default
  const position: [number, number] = currentLocation?.coordinates 
    ? [currentLocation.coordinates.latitude, currentLocation.coordinates.longitude]
    : defaultCenter;

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Your Location</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${currentLocation ? 'bg-success animate-pulse' : 'bg-gray-400'}`} />
            <span className={`text-sm font-medium ${currentLocation ? 'text-success' : 'text-gray-500'}`}>
              {currentLocation ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="h-80 relative">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {currentLocation?.coordinates && (
            <Marker position={position}>
              <Popup>
                <div className="text-center">
                  <strong>Your Current Location</strong>
                  <br />
                  {currentLocation.coordinates.latitude.toFixed(6)}, {currentLocation.coordinates.longitude.toFixed(6)}
                  {currentLocation.address && (
                    <>
                      <br />
                      <span className="text-sm text-gray-600">{currentLocation.address.formattedAddress}</span>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      
      <div className="p-4 bg-gray-50">
        <Button 
          onClick={onGetLocation} 
          disabled={isLoading}
          className="w-full bg-primary hover:bg-blue-700 text-white"
        >
          <Crosshair className="mr-2 h-4 w-4" />
          {isLoading ? "Getting Location..." : "Get Current Location"}
        </Button>
      </div>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function MapController({ 
  address, 
  position, 
  setPosition, 
  onLocationSelect 
}: { 
  address?: string, 
  position: L.LatLng | null, 
  setPosition: (p: L.LatLng) => void,
  onLocationSelect: (address: string) => void 
}) {
  const map = useMap();

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            onLocationSelect(data.display_name);
          }
        })
        .catch(console.error);
    },
  });

  useEffect(() => {
    if (!address || address.trim().length < 5) return;

    // Debounce the geocoding request by 1.5 seconds to avoid spamming the API
    const timeoutId = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            const newPos = new L.LatLng(lat, lon);
            
            // Only update if it's significantly different from current to prevent infinite loops
            if (!position || position.distanceTo(newPos) > 100) {
              setPosition(newPos);
              map.flyTo(newPos, 14);
            }
          } else {
            // Address not found
            import("sonner").then(({ toast }) => {
              toast.error("Location not found on map", {
                description: "Try searching a broader area like your city or town."
              });
            });
          }
        })
        .catch(console.error);
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [address, map]); // Not depending on `position` to avoid loops

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function MapPicker({ 
  onLocationSelect, 
  searchAddress 
}: { 
  onLocationSelect: (address: string) => void,
  searchAddress?: string
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  return (
    <div className="h-[250px] w-full border border-border mt-2 relative z-0">
      <MapContainer center={[6.9271, 79.8612]} zoom={13} scrollWheelZoom={true} touchZoom={true} dragging={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController 
          address={searchAddress} 
          position={position} 
          setPosition={setPosition} 
          onLocationSelect={onLocationSelect} 
        />
      </MapContainer>
    </div>
  );
}

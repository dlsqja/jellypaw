import { APIProvider, Map, AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

interface GoogleMapProps {
  address: string;
  title: string;
}

export default function GoogleMap({ address, title }: GoogleMapProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [mapPosition, setMapPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // address로 geocoding 수행
  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not set');
      setIsLoading(false);
      return;
    }

    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'OK' && data.results && data.results[0]) {
          const location = data.results[0].geometry.location;
          setMapPosition({
            lat: location.lat,
            lng: location.lng,
          });
        } else {
          console.error('Geocoding failed:', data.status);
        }
      })
      .catch((error) => {
        console.error('Geocoding error:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [address]);

  useEffect(() => {
    // InfoWindow의 닫기 버튼 숨기기
    const hideCloseButton = () => {
      const closeButtons = document.querySelectorAll('.gm-ui-hover-effect, button[aria-label*="Close"], button[title*="Close"]');
      closeButtons.forEach((button) => {
        (button as HTMLElement).style.display = 'none';
      });
    };

    // 지도가 로드된 후 주기적으로 닫기 버튼 숨기기
    const interval = setInterval(hideCloseButton, 100);

    return () => clearInterval(interval);
  }, []);

  // 로딩 중이거나 position이 없으면 로딩 상태 표시
  if (isLoading || !mapPosition) {
    return (
      <div className="w-full h-64 rounded-lg overflow-hidden mt-4 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">지도를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden mt-4">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
        <Map
          defaultCenter={mapPosition}
          defaultZoom={15}
          mapId="DEMO_MAP_ID"
          style={{ width: '100%', height: '100%' }}
          disableDefaultUI={true}
          zoomControl={false}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={true}
        >
          <AdvancedMarker ref={markerRef} position={mapPosition} title={title} />
        </Map>
      </APIProvider>
    </div>
  );
}

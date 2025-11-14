import { APIProvider, Map, AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';

interface GoogleMapProps {
  address: string;
  title: string;
  position: { lat: number; lng: number } | null;
}

export default function GoogleMap({ address, title, position }: GoogleMapProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();

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

  if (!address || !position) return null;

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden mt-4">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
        <Map
          defaultCenter={position}
          defaultZoom={15}
          mapId="DEMO_MAP_ID"
          style={{ width: '100%', height: '100%' }}
          disableDefaultUI={true}
          zoomControl={false}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={true}
        >
          <AdvancedMarker ref={markerRef} position={position} title={title} />
        </Map>
      </APIProvider>
    </div>
  );
}

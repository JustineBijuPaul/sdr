import { useState, useEffect } from 'react';

interface MapWrapperProps {
  children: React.ReactNode;
}

// This component will only render the map on the client side
// to avoid SSR issues with Leaflet
export function MapWithSSR({ children }: MapWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-md border">
        <p>Loading map...</p>
      </div>
    );
  }

  return <>{children}</>;
} 
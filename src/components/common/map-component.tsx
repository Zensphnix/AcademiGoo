// src/components/common/map-component.tsx
"use client";

import type { FC } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Bus, TriangleAlert } from 'lucide-react'; // Import Bus and TriangleAlert icons

interface MapComponentProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: { key?: string; lat: number; lng: number; label?: string }[];
  busLocation?: { lat: number; lng: number };
  routePath?: { lat: number; lng: number }[];
  containerStyle?: React.CSSProperties;
}

const MapComponent: FC<MapComponentProps> = ({
  center,
  zoom = 15,
  markers = [],
  busLocation,
  routePath,
  containerStyle = { height: '400px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }
}) => {
  // Ensure API Key is loaded from environment variables
  // IMPORTANT: This key MUST be valid and configured correctly in Google Cloud Console
  // (Billing enabled, APIs enabled, restrictions set if necessary)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Enhanced check for API key presence and provide better user feedback
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
     if (apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
         console.warn("Using placeholder Google Maps API key. Please replace it in the .env file.");
     } else {
         console.error("Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.");
     }
    return (
      <div
        style={containerStyle}
        className="flex flex-col items-center justify-center bg-muted text-muted-foreground border rounded-md p-4 text-center shadow-md"
      >
        <TriangleAlert className="w-8 h-8 text-destructive mb-2" />
        <p className="font-semibold">Map Configuration Error</p>
        <p className="text-xs mt-2">A valid Google Maps API key is required.</p>
        <ul className="list-disc list-inside text-left text-xs mt-2 space-y-1">
             <li>Add <code className="bg-secondary px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY</code> to your <code className="bg-secondary px-1 py-0.5 rounded">.env</code> file.</li>
             <li>Ensure the key is correct and active in Google Cloud Console.</li>
             <li>Verify that billing is enabled for the associated project.</li>
            <li>Check that the 'Maps JavaScript API' is enabled.</li>
            <li>Review API key restrictions (e.g., HTTP referrers, API restrictions).</li>
        </ul>
      </div>
    );
  }

  return (
    // Added error boundary specifically for the APIProvider in case the key is present but invalid/restricted at runtime
    <APIProvider apiKey={apiKey} libraries={['marker']} N>
      <div style={containerStyle} className="shadow-md border rounded-md"> {/* Added border */}
          <Map
            center={center}
            zoom={zoom}
            mapId="academigo-map-main"
            gestureHandling={'greedy'}
            disableDefaultUI={true}
             // Note: The InvalidKeyMapError often originates from the Google Maps script itself before React renders,
             // so this onError might not catch it, but it's good practice for other potential API errors.
            // onError={(e) => console.error("Google Maps Runtime Error:", e)} // Check if the library supports this
          >
            {/* Render regular markers (e.g., bus stops) */}
            {markers.map((marker, index) => (
              // Use marker.lat and marker.lng directly
              <AdvancedMarker key={marker.key || `marker-${index}`} position={{ lat: marker.lat, lng: marker.lng }}>
                <Pin background={'hsl(var(--primary))'} glyphColor={'hsl(var(--primary-foreground))'} borderColor={'hsl(var(--primary))'} />
                {/* TODO: Add InfoWindow on click to show marker.label */}
              </AdvancedMarker>
            ))}

            {/* Render animated bus icon if location is provided */}
            {busLocation && (
              // Use busLocation.lat and busLocation.lng directly
              <AdvancedMarker position={{ lat: busLocation.lat, lng: busLocation.lng }} zIndex={10}> {/* Ensure bus is on top */}
                 <div className="relative flex items-center justify-center">
                    <div className="absolute w-6 h-6 bg-accent/50 rounded-full animate-ping"></div>
                    <div className="relative p-1.5 bg-accent rounded-full shadow-lg">
                       <Bus size={18} className="text-accent-foreground" />
                    </div>
                </div>
              </AdvancedMarker>
            )}
            {/* TODO: Add Polyline component here to draw routePath if provided */}
          </Map>
      </div>
    </APIProvider>
  );
};

export default MapComponent;

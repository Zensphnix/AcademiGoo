"use client"; // Required for map component

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import MapComponent from '@/components/common/map-component'; // Reuse the map component
import type { Coordinate } from '@/services/maps'; // Assuming Coordinate type

// Mock data - replace with real-time fetching
const mockBusLocations: { id: string; location: Coordinate; route: string }[] = [
  { id: 'HR 26 B 7890', location: { lat: 37.778, lng: -122.415 }, route: 'South Campus Express' },
  { id: 'DL 1A 4567', location: { lat: 37.772, lng: -122.425 }, route: 'North Campus Line' },
  { id: 'UP 15 C 1122', location: { lat: 37.775, lng: -122.405 }, route: 'East Wing Shuttle' },
];

const defaultMapCenter = { lat: 37.7749, lng: -122.4194 }; // Default center (e.g., campus center)

const AdminLiveMapPage: FC = () => {
  const [busLocations, setBusLocations] = useState(mockBusLocations);
  const [mapCenter, setMapCenter] = useState(defaultMapCenter);

  useEffect(() => {
    // TODO: Implement real-time fetching of all active bus locations
    // Use WebSockets or periodic polling
    // const interval = setInterval(() => {
    //    fetch('/api/admin/live-locations')
    //      .then(res => res.json())
    //      .then(data => setBusLocations(data));
    // }, 5000); // Fetch every 5 seconds

    // return () => clearInterval(interval);

     // Adjust map center if buses are loaded and far from default
     if (busLocations.length > 0) {
         // Basic centering logic (average coords) - can be improved
         const avgLat = busLocations.reduce((sum, bus) => sum + bus.location.lat, 0) / busLocations.length;
         const avgLng = busLocations.reduce((sum, bus) => sum + bus.location.lng, 0) / busLocations.length;
        // setMapCenter({ lat: avgLat, lng: avgLng }); // Optional: center on average location
     }

  }, []); // Removed busLocations dependency to prevent potential re-centering loop

  const markers = busLocations.map(bus => ({
      lat: bus.location.lat,
      lng: bus.location.lng,
      label: `${bus.id} (${bus.route})` // Label for potential InfoWindow
  }));

  return (
     // Replaced Card with div and applied styling
     <div className="bg-card text-card-foreground rounded-lg border shadow-sm overflow-hidden">
       <div className="p-6 space-y-1.5">
        <h3 className="text-lg font-semibold leading-none tracking-tight text-primary">Live Bus Tracking Map</h3>
        <p className="text-sm text-muted-foreground">View the real-time locations of all active buses.</p>
          {/* Optional: Add filter by route or search by bus ID */}
      </div>
      <div className="p-6 pt-0"> {/* Equivalent to CardContent */}
        <MapComponent
          center={mapCenter}
          zoom={13} // Zoom out slightly to see more area
          // markers={markers} // Use regular markers for now
          // We need a way to render multiple *different* bus icons if needed
          // For now, rendering a single bus marker for each location
          // A better approach might involve custom markers based on bus ID/route
          busLocation={undefined} // Clear single bus prop
           markers={busLocations.map((bus, index) => ({ // Re-purpose markers for bus icons
             key: `bus-${bus.id}-${index}`, // Ensure unique key
             lat: bus.location.lat,
             lng: bus.location.lng,
             // label: bus.id // Could add label to pin later
           }))}
          containerStyle={{ height: '65vh', width: '100%', borderRadius: '0.5rem' }}
        />
         {/* Optional: Add a list view of buses below the map */}
      </div>
    </div>
  );
};

export default AdminLiveMapPage;

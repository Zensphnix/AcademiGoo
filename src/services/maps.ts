

/**
 * Represents a geographical coordinate with latitude and longitude.
 * Using lat/lng for consistency with @vis.gl/react-google-maps.
 */
export interface Coordinate {
  lat: number; // Changed from latitude
  lng: number; // Changed from longitude
}

/**
 * Represents a bus stop with a name and geographical coordinates.
 */
export interface BusStop {
  name: string;
  location: Coordinate; // Use Coordinate type (lat/lng)
}

/**
 * Represents a bus route, including the bus number, route name, and the stops along the route.
 */
export interface BusRoute {
  busNumber: string;
  routeName: string;
  stops: BusStop[];
}

/**
 * Retrieves bus route information for a specific route.
 * Mock implementation.
 *
 * @param identifier The route ID or name (e.g., 'Route 5 – North Campus Line').
 * @returns A promise that resolves to a BusRoute object or null if not found.
 */
export async function getBusRoute(identifier?: string): Promise<BusRoute | null> {
  // TODO: Implement this by calling an API.
  console.log(`Fetching mock bus route data for: ${identifier ?? 'default'}`);
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

  // Example: Return specific route data if identifier matches
  if (identifier === 'Route 5 – North Campus Line') {
      return {
        busNumber: 'DL 1A 4567',
        routeName: 'Route 5 – North Campus Line',
        stops: [
          { name: 'North Gate', location: { lat: 37.7749, lng: -122.4194 } },
          { name: 'Main Library', location: { lat: 37.7750, lng: -122.4195 } },
          { name: 'Admin Block', location: { lat: 37.7751, lng: -122.4196 } },
          { name: 'Science Building', location: { lat: 37.7760, lng: -122.4190 } },
          { name: 'South Gate', location: { lat: 37.7770, lng: -122.4185 } },
        ],
      };
  } else if (identifier === 'South Campus Express') {
       return {
            busNumber: 'HR 26 B 7890',
            routeName: 'South Campus Express',
            stops: [
                { name: 'South Campus Gate', location: { lat: 37.7700, lng: -122.4150 } },
                { name: 'Hostel Block D', location: { lat: 37.7710, lng: -122.4160 } },
                { name: 'Sports Complex', location: { lat: 37.7720, lng: -122.4170 } },
            ],
        };
   }

  // Return null or a default route if no identifier is provided or matched
  return null;
}


/**
 * Represents the estimated time of arrival (ETA) for a bus at a specific stop.
 */
export interface EstimatedTimeOfArrival {
  stopName: string;
  eta: string; // Keep as string for flexible formatting (e.g., "5 min", "8:15 AM")
}

/**
 * Retrieves the estimated time of arrival (ETA) for a given bus route identifier.
 * Mock implementation based on wireframe examples.
 *
 * @param identifier The route ID or name (e.g., 'Route 5 – North Campus Line').
 * @returns A promise that resolves to an array of EstimatedTimeOfArrival objects.
 */
export async function getEta(identifier?: string): Promise<EstimatedTimeOfArrival[]> {
  // TODO: Implement this by calling an API.
  console.log(`Fetching mock ETA data for: ${identifier ?? 'default'}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  // Return specific ETAs based on identifier
  if (identifier === 'Route 5 – North Campus Line') {
      return [
          { stopName: 'North Gate', eta: '8:15 AM' },
          { stopName: 'Main Library', eta: '8:25 AM' },
          { stopName: 'Admin Block', eta: '8:30 AM' },
          { stopName: 'Science Building', eta: '8:38 AM' },
          { stopName: 'South Gate', eta: '8:45 AM' },
      ];
  } else if (identifier === 'South Campus Express') {
       return [
           { stopName: 'South Campus Gate', eta: '9:05 AM' },
           { stopName: 'Hostel Block D', eta: '9:12 AM' },
           { stopName: 'Sports Complex', eta: '9:20 AM' },
       ];
   }

  // Return empty array if no identifier is provided or matched
  return [];
}


/**
 * Represents the real-time location of a bus.
 */
export interface BusLocation {
  routeId: string; // Or busNumber, depending on identifier used
  coordinate: Coordinate; // Use Coordinate type (lat/lng)
  // Optional: Add timestamp, speed, bearing etc. if available from API
  timestamp?: number;
}

/**
 * Retrieves the real-time location of a bus for a given route ID or bus number.
 * Mock implementation.
 *
 * @param identifier The route ID or bus number.
 * @returns A promise that resolves to a BusLocation object.
 */
export async function getBusLocation(identifier: string): Promise<BusLocation> {
  // TODO: Implement this by calling an API using the identifier.
  console.log(`Fetching mock bus location for ${identifier}...`);
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

  // Simulate slight movement based on route for variety
  let baseLat = 37.7755;
  let baseLng = -122.4190;

  if (identifier.includes('South')) {
      baseLat = 37.7715;
      baseLng = -122.4165;
  }

  const latOffset = (Math.random() - 0.5) * 0.001; // Small random offset
  const lngOffset = (Math.random() - 0.5) * 0.001;

  return {
    routeId: identifier, // Use the provided identifier
    coordinate: { lat: baseLat + latOffset, lng: baseLng + lngOffset }, // Use lat/lng
    timestamp: Date.now(),
  };
}

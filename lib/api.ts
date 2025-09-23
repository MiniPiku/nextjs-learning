import { Pandal, Zone, ZONE_MAPPING, Metro, ZONE_TO_BACKEND } from '@/lib';
import { getAuthHeader } from "@/lib/getAuthHeader";

// Helper function to create headers with optional authentication
function createHeaders(includeAuth: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
        const authHeader = getAuthHeader();
        if (authHeader.Authorization) {
            headers['Authorization'] = authHeader.Authorization;
        }
    }
    
    return headers;
}

// Sign up a new user
export async function signupUser(payload: { username: string; email: string; password: string }) {
    try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`;
        console.log('Signing up user at:', url);
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log('Signup API Response Status:', res.status, res.statusText);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Signup API Error Response:', errorText);
            throw new Error(`Failed to signup: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log('Signup success response:', data);
        return data;
    } catch (err) {
        console.error('Error during signup:', err);
        return null;
    }
}

// Login user
export async function loginUser(payload: { email: string; password: string }) {
    try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`;
        console.log('Logging in user at:', url);
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log('Login API Response Status:', res.status, res.statusText);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Login API Error Response:', errorText);
            throw new Error(`Failed to login: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log('Login success response:', data);
        
        // Store JWT and userId in localStorage
        if (data.jwt && data.userId) {
            localStorage.setItem('jwt', data.jwt);
            localStorage.setItem('userId', data.userId);
        }
        
        return data;
    } catch (err) {
        console.error('Error during login:', err);
        return null;
    }
}

export async function fetchNearestMetro(lat: number, lon: number) {
    try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/metro/nearest/location?lat=${lat}&lon=${lon}`;
        console.log("API URL:", url);

        const headers = createHeaders(true);

        const res = await fetch(url, {
            headers,
        });

        console.log("API Response Status:", res.status, res.statusText);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("API Error Response:", errorText);
            throw new Error(`Failed to fetch metro: ${res.status} ${res.statusText}`);
        }

        const data = await res.json(); // Expected { name, lat, lon }
        console.log("API response data:", data);
        console.log("Data type check:", {
            name: typeof data.name,
            lat: typeof data.lat,
            lon: typeof data.lon
        });

        return data;
    } catch (err) {
        console.error("API Error:", err);
        return null;
    }
}

// Fetch all pandals
export async function fetchAllPandals(): Promise<Pandal[] | null> {
    try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/pandals`;
        console.log("Fetching all pandals from:", url);
        
        const res = await fetch(url, {
            headers: createHeaders(true), // Adding auth in case it's needed
        });
        console.log("Pandals API Response Status:", res.status, res.statusText);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error("Pandals API Error Response:", errorText);
            throw new Error(`Failed to fetch pandals: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log(`Fetched ${data.length} pandals`);
        return data;
    } catch (err) {
        console.error("Error fetching pandals:", err);
        // Return empty array instead of null to prevent crashes
        return [];
    }
}

// Fetch pandals by zone
export async function fetchPandalsByZone(zone: Zone): Promise<Pandal[] | null> {
    try {
        if (zone === 'All') {
            return fetchAllPandals();
        }
        
        const zoneCode = ZONE_MAPPING[zone];
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/pandals/zone/${zoneCode}/simple`;
        console.log(`Fetching pandals for zone ${zone} (${zoneCode}) from:`, url);
        
        const res = await fetch(url, {
            headers: createHeaders(true), // Adding auth in case it's needed
        });
        console.log(`Zone ${zone} API Response Status:`, res.status, res.statusText);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Zone ${zone} API Error Response:`, errorText);
            throw new Error(`Failed to fetch pandals for zone: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log(`Fetched ${data.length} pandals for zone ${zone}`);
        return data;
    } catch (err) {
        console.error(`Error fetching pandals for zone ${zone}:`, err);
        // Return empty array instead of null to prevent crashes
        return [];
    }
}

// Fetch metros by zone
export async function fetchMetrosByZone(zone: Zone): Promise<Metro[] | null> {
    try {
        if (zone === 'All') {
            // If 'All' is selected, you might want to fetch all metros or handle differently
            console.log('Zone "All" selected - returning empty array for metros');
            return [];
        }
        
        const backendZone = ZONE_TO_BACKEND[zone];
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/zone/${backendZone}/metros/simple`;
        console.log(`Fetching metros for zone ${zone} from:`, url);
        
        const res = await fetch(url, {
            headers: createHeaders(true), // Adding auth in case it's needed
        });
        console.log(`Zone ${zone} metros API Response Status:`, res.status, res.statusText);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Zone ${zone} metros API Error Response:`, errorText);
            throw new Error(`Failed to fetch metros for zone: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log(`Fetched ${data.length} metros for zone ${zone}`);
        return data;
    } catch (err) {
        console.error(`Error fetching metros for zone ${zone}:`, err);
        return [];
    }
}

// Fetch pandals by metro and zone
export async function fetchPandalsByMetro(zone: Zone, metroId: number): Promise<Pandal[] | null> {
    try {
        const backendZone = ZONE_TO_BACKEND[zone];
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/zone/${backendZone}/metro/${metroId}/pandals/simple`;
        console.log(`Fetching pandals for metro ${metroId} in zone ${zone} from:`, url);
        
        const res = await fetch(url, {
            headers: createHeaders(true), // Adding auth in case it's needed
        });
        console.log(`Metro ${metroId} pandals API Response Status:`, res.status, res.statusText);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Metro ${metroId} pandals API Error Response:`, errorText);
            throw new Error(`Failed to fetch pandals for metro: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log(`Fetched ${data.length} pandals for metro ${metroId} in zone ${zone}`);
        return data;
    } catch (err) {
        console.error(`Error fetching pandals for metro ${metroId}:`, err);
        return [];
    }
}

// Function to fetch optimal route
export interface OptimalRouteRequest {
    startPoint: {
        lat: number;
        lon: number;
        name: string;
    };
    pandals: Array<{
        lat: number;
        lon: number;
        name: string;
    }>;
}

export interface OptimalRouteResponse {
    origin: {
        lat: number;
        lon: number;
        name: string;
    };
    destination: {
        lat: number;
        lon: number;
        name: string;
    };
    waypoints: Array<{
        lat: number;
        lon: number;
        name: string;
    }>;
}

export async function fetchOptimalRoute(routeRequest: OptimalRouteRequest): Promise<OptimalRouteResponse | null> {
    try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/route/optimal`;
        console.log('Fetching optimal route from:', url);
        console.log('Request payload:', routeRequest);

        const res = await fetch(url, {
            method: 'POST',
            headers: createHeaders(true), // This route requires authentication
            body: JSON.stringify(routeRequest),
        });

        console.log('Optimal route API Response Status:', res.status, res.statusText);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Optimal route API Error Response:', errorText);
            throw new Error(`Failed to fetch optimal route: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log('Optimal route response:', data);
        return data;
    } catch (err) {
        console.error('Error fetching optimal route:', err);
        return null;
    }
}
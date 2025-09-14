import { Pandal, Zone, ZONE_MAPPING, Metro, ZONE_TO_BACKEND } from '@/lib';

export async function fetchNearestMetro(lat: number, lon: number) {
    try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/metro/nearest/location?lat=${lat}&lon=${lon}`;
        console.log("API URL:", url);
        
        const res = await fetch(url);
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
        
        const res = await fetch(url);
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
        
        const res = await fetch(url);
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
        
        const res = await fetch(url);
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
        
        const res = await fetch(url);
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

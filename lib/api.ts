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

async function fetchNearestMetro(lat: number, lon: number) {
    try {
        const res = await fetch(
            `http://localhost:8080/metro/nearest?lat=${lat}&lon=${lon}`
        );
        if (!res.ok) throw new Error("Failed to fetch metro");
        const data = await res.json();
        return data; // { name: "Station X", lat: ..., lon: ... }
    } catch (err) {
        console.error(err);
    }
}

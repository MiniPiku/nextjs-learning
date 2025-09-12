"use client";

import { useEffect, useState } from "react";
import { fetchNearestMetro, fetchAllPandals, fetchPandalsByZone } from "@/lib/api";
import MapComponent from "@/components/MapComponent";
import MetroInfo from "@/components/MetroInfo";
import PandalSelector from "@/components/PandalSelector";
import { UserLocation, MetroStation, Pandal, Zone } from "@/lib";

export default function HomePage() {
    const [coords, setCoords] = useState<UserLocation | null>(null);
    const [station, setStation] = useState<MetroStation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pandals, setPandals] = useState<Pandal[]>([]);
    const [selectedZone, setSelectedZone] = useState<Zone>('All');
    const [pandalsLoading, setPandalsLoading] = useState(false);

    // Step 1: Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = {
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                    };
                    console.log("User geolocation:", coords);
                    setCoords(coords);
                },
                (err) => {
                    console.error("Error getting location:", err);
                    setError("Unable to get your location. Please enable location access.");
                }
            );
        } else {
            alert("Geolocation not supported");
        }
    }, []);

    // Step 2: Fetch nearest metro when coords available
    useEffect(() => {
        if (coords) {
            setLoading(true);
            setError(null);
            fetchNearestMetro(coords.lat, coords.lon)
                .then((stationData) => {
                    console.log("Station data received:", stationData);
                    if (stationData) {
                        setStation(stationData);
                    } else {
                        setError("No metro station found nearby.");
                    }
                })
                .catch((err) => {
                    console.error("Error fetching metro:", err);
                    setError("Failed to fetch nearest metro station. Please check your backend connection.");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [coords]);

    // Step 3: Fetch pandals on mount and when zone changes
    useEffect(() => {
        setPandalsLoading(true);
        const fetchPandals = selectedZone === 'All' ? fetchAllPandals() : fetchPandalsByZone(selectedZone);
        
        fetchPandals
            .then((pandalData) => {
                if (pandalData) {
                    setPandals(pandalData);
                    console.log(`Loaded ${pandalData.length} pandals for zone: ${selectedZone}`);
                } else {
                    setPandals([]);
                    console.log('No pandals found');
                }
            })
            .catch((err) => {
                console.error('Error fetching pandals:', err);
                setPandals([]);
            })
            .finally(() => {
                setPandalsLoading(false);
            });
    }, [selectedZone]);

    return (
        <main className="container mx-auto p-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-center mb-4">Nearest Metro Finder</h1>
                <p className="text-center text-gray-600 dark:text-gray-300">
                    Find your nearest metro station and get directions
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}

            {!coords && !error && (
                <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                    <p className="text-lg mb-2">Getting your location...</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Please allow location access when prompted
                    </p>
                </div>
            )}

            {loading && (
                <div className="text-center p-6 mb-6">
                    <p className="text-lg">Finding nearest metro station...</p>
                </div>
            )}

            {coords && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        📍 Your Location: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                    </p>
                </div>
            )}

            {station && (
                <div className="mb-6">
                    <MetroInfo station={station} />
                </div>
            )}

            <PandalSelector 
                selectedZone={selectedZone}
                onZoneChange={setSelectedZone}
                isLoading={pandalsLoading}
            />

            {pandals.length > 0 && (
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                        🎪 Showing {pandals.length} pandals in {selectedZone === 'All' ? 'all zones' : selectedZone}
                    </p>
                </div>
            )}

            <div className="rounded-lg overflow-hidden shadow-lg">
                <MapComponent user={coords} metro={station} pandals={pandals} />
            </div>
        </main>
    );
}

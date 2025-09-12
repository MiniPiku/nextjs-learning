"use client";

import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { UserLocation, MetroStation, Pandal } from "@/lib";

interface MapComponentProps {
    user: UserLocation | null;
    metro: MetroStation | null;
    pandals?: Pandal[];
}

export default function MapComponent({ user, metro, pandals = [] }: MapComponentProps) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    });

    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [selectedPandal, setSelectedPandal] = useState<Pandal | null>(null);

    useEffect(() => {
        if (isLoaded && user && metro) {
            // Debug: Log the coordinate values
            console.log("User coordinates:", user);
            console.log("Metro coordinates:", metro);
            console.log("Pandals count:", pandals.length);

            const userLat = Number(user.lat);
            const userLng = Number(user.lon);
            const metroLat = Number(metro.lat);
            const metroLng = Number(metro.lon);

            console.log("Converted coordinates:", {
                user: { lat: userLat, lng: userLng },
                metro: { lat: metroLat, lng: metroLng }
            });

            // Validate coordinates
            if (isNaN(userLat) || isNaN(userLng) || isNaN(metroLat) || isNaN(metroLng)) {
                console.error("Invalid coordinates detected:", {
                    original: { user, metro },
                    converted: {
                        user: { lat: userLat, lng: userLng },
                        metro: { lat: metroLat, lng: metroLng }
                    },
                    validationResults: {
                        userLat: { value: userLat, isNaN: isNaN(userLat) },
                        userLng: { value: userLng, isNaN: isNaN(userLng) },
                        metroLat: { value: metroLat, isNaN: isNaN(metroLat) },
                        metroLng: { value: metroLng, isNaN: isNaN(metroLng) }
                    }
                });
                return;
            }

            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: { lat: userLat, lng: userLng },
                    destination: { lat: metroLat, lng: metroLng },
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    console.log("Directions result:", { status, result });
                    if (status === "OK" && result) {
                        setDirections(result);
                    } else {
                        console.error("Directions error:", status);
                    }
                }
            );
        }
    }, [isLoaded, user, metro]);

    if (!isLoaded) return <p>Loading Map...</p>;

    // Determine center point - use user location if available, otherwise use first pandal or default
    let centerLat = 22.5726; // Default Kolkata coordinates
    let centerLng = 88.3639;

    if (user) {
        centerLat = Number(user.lat);
        centerLng = Number(user.lon);
    } else if (pandals.length > 0) {
        centerLat = pandals[0].latitude;
        centerLng = pandals[0].longitude;
    }

    return (
        <GoogleMap
            center={{ lat: centerLat, lng: centerLng }}
            zoom={13}
            mapContainerStyle={{ width: "100%", height: "500px" }}
        >
            {/* User Marker */}
            {user && !isNaN(Number(user.lat)) && !isNaN(Number(user.lon)) && (
                <Marker
                    position={{ lat: Number(user.lat), lng: Number(user.lon) }}
                    label={"You"}
                    icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    }}
                />
            )}

            {/* Metro Marker */}
            {metro && !isNaN(Number(metro.lat)) && !isNaN(Number(metro.lon)) && (
                <Marker
                    position={{ lat: Number(metro.lat), lng: Number(metro.lon) }}
                    label={String(metro.name || "Metro Station")}
                    icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    }}
                />
            )}

            {/* Pandal Markers */}
            {pandals.map((pandal, index) => (
                <Marker
                    key={`pandal-${index}`}
                    position={{ lat: pandal.latitude, lng: pandal.longitude }}
                    title={pandal.name}
                    onClick={() => setSelectedPandal(pandal)}
                    icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    }}
                />
            ))}

            {/* Info Window for selected pandal */}
            {selectedPandal && (
                <InfoWindow
                    position={{ lat: selectedPandal.latitude, lng: selectedPandal.longitude }}
                    onCloseClick={() => setSelectedPandal(null)}
                >
                    <div className="p-2">
                        <h3 className="font-semibold text-sm">{selectedPandal.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                            Lat: {selectedPandal.latitude.toFixed(4)},
                            Lng: {selectedPandal.longitude.toFixed(4)}
                        </p>
                    </div>
                </InfoWindow>
            )}

            {/* Directions */}
            {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
    );
}

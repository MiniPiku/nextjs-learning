"use client";

import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { UserLocation, MetroStation } from "@/lib";

export default function MapComponent({ user, metro }: { user: UserLocation; metro: MetroStation }) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    });

    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    useEffect(() => {
        if (isLoaded && user && metro) {
            // Debug: Log the coordinate values
            console.log("User coordinates:", user);
            console.log("Metro coordinates:", metro);
            
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

    // Validate coordinates before rendering
    const userLat = Number(user.lat);
    const userLng = Number(user.lon);
    const metroLat = Number(metro.lat);
    const metroLng = Number(metro.lon);

    if (isNaN(userLat) || isNaN(userLng) || isNaN(metroLat) || isNaN(metroLng)) {
        return <p>Error: Invalid coordinates received</p>;
    }

    return (
        <GoogleMap
            center={{ lat: userLat, lng: userLng }}
            zoom={13}
            mapContainerStyle={{ width: "100%", height: "500px" }}
        >
            <Marker position={{ lat: userLat, lng: userLng }} label="You" />
            <Marker position={{ lat: metroLat, lng: metroLng }} label={metro.name} />
            {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
    );
}

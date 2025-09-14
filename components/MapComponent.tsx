"use client";

import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { UserLocation, MetroStation, Pandal, Metro, Zone } from "@/lib";

interface MapComponentProps {
    user: UserLocation | null;
    metro: MetroStation | null;
    pandals?: Pandal[];
    metros?: Metro[];
    selectedZone: Zone;
    onMetroClick?: (metroId: number) => void;
    selectedMetroId?: number | null;
}

export default function MapComponent({
                                         user,
                                         metro,
                                         pandals = [],
                                         metros = [],
                                         selectedZone,
                                         onMetroClick,
                                         selectedMetroId
                                     }: MapComponentProps) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    });

    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [selectedPandal, setSelectedPandal] = useState<Pandal | null>(null);
    const [selectedMetro, setSelectedMetro] = useState<Metro | null>(null);

    // Generate directions only when showing nearest metro (zone === 'All')
    useEffect(() => {
        if (isLoaded && user && metro && selectedZone === 'All') {
            console.log("Generating directions - User:", user, "Metro:", metro);

            const userLat = Number(user.lat);
            const userLng = Number(user.lon);
            const metroLat = Number(metro.lat);
            const metroLng = Number(metro.lon);

            // Validate coordinates
            if (isNaN(userLat) || isNaN(userLng) || isNaN(metroLat) || isNaN(metroLng)) {
                console.error("Invalid coordinates for directions:", {
                    user: { lat: userLat, lng: userLng },
                    metro: { lat: metroLat, lng: metroLng }
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
                        setDirections(null);
                    }
                }
            );
        } else {
            // Clear directions when zone is selected or no data available
            setDirections(null);
        }
    }, [isLoaded, user, metro, selectedZone]);

    // Handle metro click
    const handleMetroClick = (metro: Metro) => {
        console.log('Metro clicked in map:', metro);
        setSelectedMetro(metro);
        if (onMetroClick) {
            onMetroClick(metro.metroId);
        }
    };

    if (!isLoaded) return <p>Loading Map...</p>;

    // Determine center point
    let centerLat = 22.5726; // Default Kolkata coordinates
    let centerLng = 88.3639;

    if (user) {
        centerLat = Number(user.lat);
        centerLng = Number(user.lon);
    } else if (metros.length > 0) {
        centerLat = metros[0].metroLat;
        centerLng = metros[0].metroLon;
    } else if (metro) {
        centerLat = Number(metro.lat);
        centerLng = Number(metro.lon);
    } else if (pandals.length > 0) {
        centerLat = pandals[0].latitude;
        centerLng = pandals[0].longitude;
    }

    return (
        <GoogleMap
            center={{ lat: centerLat, lng: centerLng }}
            zoom={13}
            mapContainerStyle={{ width: "100%", height: "500px" }}
            onClick={() => {
                // Close info windows when clicking on map
                setSelectedPandal(null);
                setSelectedMetro(null);
            }}
        >
            {/* User Marker */}
            {user && !isNaN(Number(user.lat)) && !isNaN(Number(user.lon)) && (
                <Marker
                    position={{ lat: Number(user.lat), lng: Number(user.lon) }}
                    title="Your Location"
                    icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    }}
                />
            )}

            {/* Nearest Metro Marker (only when no zone is selected) */}
            {metro && !isNaN(Number(metro.lat)) && !isNaN(Number(metro.lon)) && selectedZone === 'All' && (
                <Marker
                    position={{ lat: Number(metro.lat), lng: Number(metro.lon) }}
                    title={metro.name || "Nearest Metro Station"}
                    icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    }}
                />
            )}

            {/* Zone Metro Markers */}
            {metros.map((metroItem) => (
                <Marker
                    key={`zone-metro-${metroItem.metroId}`}
                    position={{ lat: metroItem.metroLat, lng: metroItem.metroLon }}
                    title={metroItem.metroName}
                    onClick={() => handleMetroClick(metroItem)}
                    icon={{
                        url: selectedMetroId === metroItem.metroId
                            ? "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                            : "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                        scaledSize: selectedMetroId === metroItem.metroId
                            ? new google.maps.Size(40, 40)
                            : new google.maps.Size(32, 32)
                    }}
                />
            ))}

            {/* Pandal Markers */}
            {pandals.map((pandal, index) => (
                <Marker
                    key={`pandal-${index}-${pandal.latitude}-${pandal.longitude}`}
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

            {/* Info Window for selected metro */}
            {selectedMetro && (
                <InfoWindow
                    position={{ lat: selectedMetro.metroLat, lng: selectedMetro.metroLon }}
                    onCloseClick={() => setSelectedMetro(null)}
                >
                    <div className="p-2">
                        <h3 className="font-semibold text-sm">{selectedMetro.metroName}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                            Metro ID: {selectedMetro.metroId}
                        </p>
                        <p className="text-xs text-gray-600">
                            Lat: {selectedMetro.metroLat.toFixed(4)},
                            Lng: {selectedMetro.metroLon.toFixed(4)}
                        </p>
                        {selectedMetroId === selectedMetro.metroId && pandals.length > 0 && (
                            <p className="text-xs text-green-600 mt-2 font-semibold">
                                Showing {pandals.length} pandal(s)
                            </p>
                        )}
                    </div>
                </InfoWindow>
            )}

            {/* Directions (only for nearest metro when no zone selected) */}
            {directions && selectedZone === ('All' as Zone) && (
                <DirectionsRenderer directions={directions} />
            )}
        </GoogleMap>
    );
}
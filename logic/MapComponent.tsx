"use client";

import {
    GoogleMap,
    Marker,
    DirectionsRenderer,
    useJsApiLoader,
    InfoWindow,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { UserLocation, MetroStation, Pandal, Metro, Zone } from "@/lib";
import { RippleButton } from "@/components/magicui/ripple-button";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";
import { fetchOptimalRoute, OptimalRouteRequest, OptimalRouteResponse } from "@/lib/api";

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
                                         selectedMetroId,
                                     }: MapComponentProps) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    });

    const [directions, setDirections] =
        useState<google.maps.DirectionsResult | null>(null);
    const [selectedPandal, setSelectedPandal] = useState<Pandal | null>(null);
    const [selectedMetro, setSelectedMetro] = useState<Metro | null>(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [optimalRoute, setOptimalRoute] = useState<OptimalRouteResponse | null>(null);

    // ✅ State for persistent center
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
        lat: 22.5726,
        lng: 88.3639, // Default Kolkata
    });
    const [lockCenter, setLockCenter] = useState(false);

    // Directions for "All" zone
    useEffect(() => {
        if (isLoaded && user && metro && selectedZone === "All") {
            const userLat = Number(user.lat);
            const userLng = Number(user.lon);
            const metroLat = Number(metro.lat);
            const metroLng = Number(metro.lon);

            if (isNaN(userLat) || isNaN(userLng) || isNaN(metroLat) || isNaN(metroLng)) {
                console.error("Invalid coordinates for directions");
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
                    if (status === "OK" && result) {
                        setDirections(result);
                    } else {
                        setDirections(null);
                    }
                }
            );
        } else {
            setDirections(null);
        }
    }, [isLoaded, user, metro, selectedZone]);

    // ✅ Initial center set from user only if not locked
    useEffect(() => {
        if (!lockCenter && user) {
            setMapCenter({ lat: Number(user.lat), lng: Number(user.lon) });
        }
    }, [user, lockCenter]);

    // Clear optimal route when zone or metro changes
    useEffect(() => {
        setOptimalRoute(null);
        setDirections(null);
    }, [selectedZone, selectedMetroId]);

    // Handle metro click
    const handleMetroClick = (metro: Metro) => {
        setSelectedMetro(metro);
        setMapCenter({ lat: metro.metroLat, lng: metro.metroLon }); // ✅ recenter
        setLockCenter(true);
        if (onMetroClick) onMetroClick(metro.metroId);
    };

    // Handle pandal click
    const handlePandalClick = (pandal: Pandal) => {
        setSelectedPandal(pandal);
        setMapCenter({ lat: pandal.latitude, lng: pandal.longitude }); // ✅ recenter
        setLockCenter(true);
    };

    // Handle establish route
    const handleEstablishRoute = async () => {
        if (!selectedMetro || pandals.length === 0) {
            console.error("No metro selected or no pandals available");
            return;
        }

        setIsLoadingRoute(true);

        try {
            // Prepare the request payload
            const routeRequest: OptimalRouteRequest = {
                startPoint: {
                    lat: selectedMetro.metroLat,
                    lon: selectedMetro.metroLon,
                    name: selectedMetro.metroName,
                },
                pandals: pandals.map(pandal => ({
                    lat: pandal.latitude,
                    lon: pandal.longitude,
                    name: pandal.name,
                })),
            };

            const optimalRouteResponse = await fetchOptimalRoute(routeRequest);

            if (optimalRouteResponse) {
                setOptimalRoute(optimalRouteResponse);

                // Create Google Maps directions request
                const waypoints = optimalRouteResponse.waypoints.map(wp => ({
                    location: { lat: wp.lat, lng: wp.lon },
                    stopover: true,
                }));

                const directionsService = new google.maps.DirectionsService();
                directionsService.route(
                    {
                        origin: {
                            lat: optimalRouteResponse.origin.lat,
                            lng: optimalRouteResponse.origin.lon
                        },
                        destination: {
                            lat: optimalRouteResponse.destination.lat,
                            lng: optimalRouteResponse.destination.lon
                        },
                        waypoints: waypoints,
                        optimizeWaypoints: false, // We already have optimized order from backend
                        travelMode: google.maps.TravelMode.DRIVING,
                    },
                    (result, status) => {
                        if (status === "OK" && result) {
                            setDirections(result);
                            console.log("Route established successfully");
                        } else {
                            console.error("Failed to get directions from Google Maps:", status);
                        }
                    }
                );
            }
        } catch (error) {
            console.error("Error establishing route:", error);
        } finally {
            setIsLoadingRoute(false);
        }
    };

    if (!isLoaded) return <p>Loading Map...</p>;

    return (
        <div className="relative">
            <GoogleMap
                center={mapCenter}
                zoom={13}
                mapContainerStyle={{ width: "100%", height: "500px" }}
                onClick={() => {
                    setSelectedPandal(null);
                    setSelectedMetro(null);
                }}
            >
                {/* User Marker */}
                {user && (
                    <Marker
                        position={{ lat: Number(user.lat), lng: Number(user.lon) }}
                        title="Your Location"
                        icon={{
                            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        }}
                    />
                )}

                {/* Nearest Metro Marker (only when no zone is selected) */}
                {metro && selectedZone === "All" && (
                    <Marker
                        position={{ lat: Number(metro.lat), lng: Number(metro.lon) }}
                        title={metro.name || "Nearest Metro Station"}
                        icon={{
                            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
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
                            url:
                                selectedMetroId === metroItem.metroId
                                    ? "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                                    : "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                            scaledSize:
                                selectedMetroId === metroItem.metroId
                                    ? new google.maps.Size(40, 40)
                                    : new google.maps.Size(32, 32),
                        }}
                    />
                ))}

                {/* Pandal Markers */}
                {pandals.map((pandal, index) => (
                    <Marker
                        key={`pandal-${index}`}
                        position={{ lat: pandal.latitude, lng: pandal.longitude }}
                        title={pandal.name}
                        onClick={() => handlePandalClick(pandal)}
                        icon={{
                            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                        }}
                    />
                ))}

                {/* Info Window for selected pandal */}
                {selectedPandal && (
                    <InfoWindow
                        position={{
                            lat: selectedPandal.latitude,
                            lng: selectedPandal.longitude,
                        }}
                        onCloseClick={() => setSelectedPandal(null)}
                    >
                        <div className="p-2">
                            <h3 className="font-semibold text-sm text-black">{selectedPandal.name}</h3>
                            <p className="text-xs text-gray-600 mt-1">
                                Lat: {selectedPandal.latitude.toFixed(4)}, Lng:{" "}
                                {selectedPandal.longitude.toFixed(4)}
                            </p>
                        </div>
                    </InfoWindow>
                )}

                {/* Info Window for selected metro */}
                {selectedMetro && (
                    <InfoWindow
                        position={{
                            lat: selectedMetro.metroLat,
                            lng: selectedMetro.metroLon,
                        }}
                        onCloseClick={() => setSelectedMetro(null)}
                    >
                        <div className="p-2">
                            <h3 className="font-semibold text-sm text-black">
                                {selectedMetro.metroName}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                                Metro ID: {selectedMetro.metroId}
                            </p>
                            <p className="text-xs text-gray-600">
                                Lat: {selectedMetro.metroLat.toFixed(4)}, Lng:{" "}
                                {selectedMetro.metroLon.toFixed(4)}
                            </p>
                            {selectedMetroId === selectedMetro.metroId &&
                                pandals.length > 0 && (
                                    <p className="text-xs text-green-600 mt-2 font-semibold">
                                        Showing {pandals.length} pandal(s)
                                    </p>
                                )}
                        </div>
                    </InfoWindow>
                )}

                {/* Directions */}
                {directions && (
                    <DirectionsRenderer
                        directions={directions}
                        options={{
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor: selectedZone === "All" ? "#4285F4" : "#34A853", // Blue for All zone, Green for optimal routes
                                strokeWeight: 6,
                                strokeOpacity: 0.8,
                            },
                        }}
                    />
                )}
            </GoogleMap>

            {/* Control Buttons */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                {/* Establish Route Button */}
                {selectedMetro && pandals.length > 0 && selectedZone !== "All" && (
                    <RippleButton
                        onClick={handleEstablishRoute}
                        disabled={isLoadingRoute}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        {isLoadingRoute ? "Planning Route..." : "Establish Route"}
                    </RippleButton>
                )}

                {/* Clear Route Button */}
                {directions && optimalRoute && (
                    <RippleButton
                        onClick={() => {
                            setDirections(null);
                            setOptimalRoute(null);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        Clear Route
                    </RippleButton>
                )}

                {/* Reset to My Location Button */}
                <RippleButton
                    onClick={() => {
                        if (user) {
                            setMapCenter({ lat: Number(user.lat), lng: Number(user.lon) });
                            setLockCenter(false);
                        }
                    }}
                    className=""
                >
                    Reset to My Location
                </RippleButton>
            </div>

            {/* Route Info Panel */}
            {optimalRoute && (
                <div className="absolute top-4 left-4 bg-black p-4 rounded-lg shadow-lg max-w-sm">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-sm">Optimal Route</h3>
                        <button
                            onClick={() => setOptimalRoute(null)}
                            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                        >
                            ×
                        </button>
                    </div>
                    <div className="text-xs space-y-1">
                        <p><strong>Start:</strong> {optimalRoute.origin.name}</p>
                        {optimalRoute.waypoints.length > 0 && (
                            <div>
                                <strong>Waypoints:</strong>
                                <ul className="ml-2">
                                    {optimalRoute.waypoints.map((wp, idx: number) => (
                                        <li key={idx}>• {wp.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <p><strong>End:</strong> {optimalRoute.destination.name}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
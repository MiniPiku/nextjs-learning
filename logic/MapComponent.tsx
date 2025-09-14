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
                {directions && selectedZone === "All" && (
                    <DirectionsRenderer directions={directions} />
                )}
            </GoogleMap>

            {/* ✅ Reset Button */}
            <RippleButton
                onClick={() => {
                    if (user) {
                        setMapCenter({ lat: Number(user.lat), lng: Number(user.lon) });
                        setLockCenter(false);
                    }
                }}
                className="absolute bottom-4 right-4"
            >
                Reset to My Location
            </RippleButton>
        </div>
    );
}

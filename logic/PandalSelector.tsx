"use client";

import { Zone } from "@/lib";

interface PandalSelectorProps {
    selectedZone: Zone;
    onZoneChange: (zone: Zone) => void;
    isLoading?: boolean;
}

export default function PandalSelector({ selectedZone, onZoneChange, isLoading }: PandalSelectorProps) {
    const zones: Zone[] = ['All', 'North', 'South', 'East', 'Central', 'Howrah'];

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
            <label htmlFor="zone-select" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Select Pandal Zone
            </label>
            <select
                id="zone-select"
                value={selectedZone}
                onChange={(e) => onZoneChange(e.target.value as Zone)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {zones.map(zone => (
                    <option key={zone} value={zone}>
                        {zone === 'All' ? 'All Zones' : zone}
                    </option>
                ))}
            </select>
            {isLoading && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading pandals...</p>
            )}
        </div>
    );
}
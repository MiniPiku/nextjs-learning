import { MetroStation } from "@/lib";

export default function MetroInfo({ station }: { station: MetroStation }) {
    return (
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                🚇 Nearest Metro Station
            </h2>
            <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {station.name}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <p>Latitude: {Number(station.lat).toFixed(6)}</p>
                    <p>Longitude: {Number(station.lon).toFixed(6)}</p>
                </div>
            </div>
        </div>
    );
}

export type UserLocation = {
    lat: number;
    lon: number;
};

export type MetroStation = {
    name: string;
    lat: number;
    lon: number;
};

export type Pandal = {
    name: string;
    latitude: number;
    longitude: number;
};

export type Zone = 'North' | 'South' | 'East' | 'Central' | 'Howrah' | 'All';

export const ZONE_MAPPING: Record<Zone, string> = {
    'North': 'CCU-N',
    'South': 'CCU-S',
    'East': 'CCU-E',
    'Central': 'CCU-C',
    'Howrah': 'HWH',
    'All': 'all'
};

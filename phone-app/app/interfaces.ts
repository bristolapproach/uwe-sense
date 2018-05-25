import {Characteristic, Peripheral, Service} from "nativescript-bluetooth";
import {Location} from "nativescript-geolocation";

export interface CreateDevice {
    deviceId: string;
    typeIds: string[];
}

export interface LocationData {
    location?: Location;
}

export interface SensorReading extends LocationData {
    session: Date;
    deviceId: string;
    typeId: string;
    timestamp: Date;
    data: number;
}

export interface Note extends LocationData {
    session: Date;
    text: string;
    timestamp: Date;
}

export interface UnregisterDevice {
    deviceId: string;
    purgeData: boolean;
}

export interface UWEPeripheral extends Peripheral {
    battery?: number;
    connecting?: boolean;
    tasks?: number[];
    services: UWEService[];
}

export interface UWEService extends Service {
    characteristics: UWECharacteristic[]
}

export interface UWECharacteristic extends Characteristic {
    resample?: {
        hours: number;
        minutes: number;
        seconds: number;
    }
}

import {SENSOR_SERVICE_ID} from "./configuration";
import {UWECharacteristic, UWEPeripheral, UWEService} from "./interfaces";

export function addPeripheral(peripherals: UWEPeripheral[], peripheral: UWEPeripheral): void {
    deletePeripheral(peripherals, peripheral.UUID);
    peripherals.push(peripheral);
}

export function deletePeripheral(peripherals: UWEPeripheral[], peripheralId: string): boolean {
    let target: boolean = false;
    for (let i = 0; i < peripherals.length; i++) {
        if (peripherals[i].UUID == peripheralId) {
            peripherals.splice(i, 1);
            target = true;
        }
    }
    return target;
}

export function findPeripheral(peripherals: UWEPeripheral[], peripheralId: string): UWEPeripheral {
    for (let peripheral of peripherals) {
        if (peripheral.UUID == peripheralId) {
            return peripheral;
        }
    }
    return null;
}

export function getUWESenseService(peripheral: UWEPeripheral): UWEService {
    for (let i = 0; i < peripheral.services.length; i++) {
        const service = peripheral.services[i];

        if (service.UUID == SENSOR_SERVICE_ID || service.UUID == "A80B") {
            return service;
        }
    }
    return null;
}


export function getCharacteristic(service, characteristicId): UWECharacteristic {
    for (let i = 0; i < service.characteristics.length; i++) {
        const characteristic = service.characteristics[i];
        if (characteristic.UUID == characteristicId) {
            return characteristic;
        }
    }
    return null;
}

import {SENSOR_SERVICE_ID} from "./configuration";

export function addPeripheral(peripherals: any[], peripheral: any): void {
    deletePeripheral(peripherals, peripheral.UUID);
    peripherals.push(peripheral);
}

export function deletePeripheral(peripherals: any[], peripheralId: string): void {
    for (let i = 0; i < peripherals.length; i++) {
        if (peripherals[i].UUID == peripheralId) {
            peripherals.splice(i, 1);
        }
    }
}

export function findPeripheral(peripherals: any[], uuid: string) {
    for (let peripheral of peripherals) {
        if (peripheral.UUID == uuid) {
            return peripheral;
        }
    }
    return null;
}

export function getUWESenseService(peripheral) {
    for (let i = 0; i < peripheral.services.length; i++) {
        const service = peripheral.services[i];

        if (service.UUID == SENSOR_SERVICE_ID) {
            return service;
        }
    }
    return null;
}


export function getCharacteristic(service, characteristicId) {
    for (let i = 0; i < service.characteristics.length; i++) {
        const characteristic = service.characteristics[i];
        if (characteristic.UUID == characteristicId) {
            return characteristic;
        }
    }
    return null;
}

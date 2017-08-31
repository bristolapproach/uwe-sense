/**
 * @module app.ts
 * @author Benedict R. Gaster
 * @copyright Benedict R. Gaster 2017
 *
 * @license See LICENSE
 */

import UWESense from "./BLEUWESense";

// Instance of BLE remote device
let bleUWESense = new UWESense();

// Add listener for BLE sensor
bleUWESense.addListener(bleUWESense.receivedEvent, msg => {
    console.log('received msg');
});

console.log('UWE Sense Server running');

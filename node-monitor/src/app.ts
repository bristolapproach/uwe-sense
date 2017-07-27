// /<reference path="../ts/node.d.ts" />
// /<reference path='../ts/ws.d.ts' />

/**
 * @module app.ts
 * @author Benedict R. Gaster
 * @copyright Benedict R. Gaster 2017
 *
 * @license See LICENSE
 */

// import our BLE module for the controller
import UWESense from "./BLEUWESense";

// instance of BLE remote device
let bleUWESense = new UWESense()

// add listener for BLE sensor
bleUWESense.addListener(bleUWESense.receivedEvent, msg => {
   console.log('received msg');
})

console.log('UWE Sense Server running');

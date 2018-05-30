import {Component, NgZone, OnInit} from "@angular/core";
import {
    connect,
    disconnect,
    hasCoarseLocationPermission,
    ReadResult,
    requestCoarseLocationPermission,
    startNotifying,
    startScanning,
    write,
    read
} from "nativescript-bluetooth";
import {TextDecoder} from "text-encoding";
import {RouterExtensions} from "nativescript-angular";
import {File, knownFolders} from "tns-core-modules/file-system";
import {ApiService} from "../app.service";
import {
    DEFAULT_RESAMPLE_RATE,
    NOTIFY_CHARACTERISTICS,
    SCAN_DURATION_SECONDS,
    SENSOR_SERVICE_ID
} from "../configuration";
import {addPeripheral, deletePeripheral, findPeripheral, getUWESenseService} from "../util";
import {SensorReading, UWECharacteristic, UWEPeripheral, UWEService} from "../interfaces";
const platformModule = require("tns-core-modules/platform");

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./connect.component.html",
})
export class ConnectComponent implements OnInit {

    private scanning: boolean = false;
    private scanningText: string = "Scanning";
    private disconnectedKnownPeripherals: UWEPeripheral[] = [];
    private disconnectedPeripherals: UWEPeripheral[] = [];
    private connectedPeripherals: UWEPeripheral[] = [];
    private connectingIds: Set<string> = new Set();
    private knownPeripheralsFile: File;
    private devicesFound: number = 0;

    constructor(private zone: NgZone,
                private routerExtensions: RouterExtensions,
                private api: ApiService) {
    }

    public ngOnInit(): void {
        this.knownPeripheralsFile = knownFolders.currentApp().getFile("known-peripherals.json");
        this.knownPeripheralsFile.readText().then(content => {
            if (!content) {
                return;
            }

            this.disconnectedKnownPeripherals = JSON.parse(content);

            for (let i = 0; i < this.disconnectedKnownPeripherals.length; i++) {
                const peripheral = this.disconnectedKnownPeripherals[i];
                if (!peripheral.services) {
                    deletePeripheral(this.disconnectedKnownPeripherals, peripheral.UUID);
                    continue;
                }

                if (findPeripheral(this.connectedPeripherals, peripheral.UUID)) {
                    deletePeripheral(this.disconnectedKnownPeripherals, peripheral.UUID);
                } else {
                    this.connect(peripheral, false);
                }
            }
        });
    }

    public quitSession(): void {
        for (let i = 0; i < this.connectedPeripherals.length; i++) {
            const peripheral = this.connectedPeripherals[i];
            disconnect({UUID: peripheral.UUID});
        }

        this.routerExtensions.navigate(["/session"], {clearHistory: true});
    }

    public viewDataUnity(): void {
        this.routerExtensions.navigate(["/dataunity"], {clearHistory: false});
    }

    public addNote(): void {
        this.routerExtensions.navigate(["/note"], {clearHistory: false});
    }

    public configure(peripheral: UWEPeripheral): void {
        const params = {
            peripheralId: peripheral.UUID
        };

        this.routerExtensions.navigate(["/peripheral", params], {clearHistory: false});
    }

    public scan(): void {
        if (this.scanning) {
            alert("You are already scanning!");
            return;
        }

        hasCoarseLocationPermission().then((granted: boolean) => {
            if (granted) {
                return Promise.resolve();
            } else {
                return requestCoarseLocationPermission();
            }
        }).then(() => {
            this.scanning = true;
            this.scanningText = "Scanning (" + SCAN_DURATION_SECONDS + " seconds remain)";

            for (let i = 1; i < SCAN_DURATION_SECONDS; i++) {
                setTimeout(() => {
                    this.scanningText = "Scanning (" + i + " seconds remain)";
                }, (SCAN_DURATION_SECONDS - i) * 1000);
            }

            this.devicesFound = 0;

            return startScanning({
                serviceUUIDs: [SENSOR_SERVICE_ID],
                seconds: SCAN_DURATION_SECONDS,
                onDiscovered: (peripheral: UWEPeripheral) => this.onDiscovered(peripheral),
                skipPermissionCheck: false
            });
        }).then(() => {
            this.scanning = false;
            alert("Scan complete, " + this.devicesFound + " devices found.");
        }, error => {
            this.scanning = false;
            alert("Scanning error: " + error);
        });
    }

    public onDiscovered(peripheral: UWEPeripheral): void {
        if (findPeripheral(this.disconnectedKnownPeripherals, peripheral.UUID)) {
            this.connect(peripheral, true);
            this.devicesFound++;
        } else if (!findPeripheral(this.disconnectedPeripherals, peripheral.UUID)) {
            this.disconnectedPeripherals.push(peripheral);
            this.devicesFound++;
        }
    }

    public connect(peripheral: UWEPeripheral, msg: boolean): void {
        if (this.connectingIds.has(peripheral.UUID)) {
            alert("Already connecting to " + peripheral.name);
            return;
        }

        this.connectingIds.add(peripheral.UUID);
        peripheral.connecting = true;
        connect({
            UUID: peripheral.UUID,
            onConnected: (peripheral: UWEPeripheral) => this.onConnected(peripheral, msg),
            onDisconnected: () => this.onDisconnected(peripheral)
        });
    }

    public onConnected(peripheral: UWEPeripheral, sendMessage: boolean): void {
        if (sendMessage) {
            alert("Connected to " + peripheral.name);
        }

        // Save peripherals.
        const tempPeripheral: UWEPeripheral = findPeripheral(this.disconnectedKnownPeripherals, peripheral.UUID);

        if (tempPeripheral != null) {
            peripheral = tempPeripheral;
        }

        deletePeripheral(this.disconnectedKnownPeripherals, peripheral.UUID);
        deletePeripheral(this.disconnectedPeripherals, peripheral.UUID);
        addPeripheral(this.connectedPeripherals, peripheral);

        const serializedPeripherals: string = JSON.stringify(Array.from(this.connectedPeripherals.concat(this.disconnectedKnownPeripherals)));

        this.knownPeripheralsFile.writeText(serializedPeripherals).then(() => {
            console.log("Successfully saved known devices to file");
        });

        const service: UWEService = getUWESenseService(peripheral);

        if (service == null) {
            disconnect({UUID: peripheral.UUID});
            return;
        }

        const writes = [];

        for (let i = 0; i < service.characteristics.length; i++) {
            const characteristic = service.characteristics[i];

            if (!NOTIFY_CHARACTERISTICS.hasOwnProperty(characteristic.UUID)) {
                continue;
            }

            if (!characteristic.hasOwnProperty("resample")) {
                characteristic.resample = DEFAULT_RESAMPLE_RATE;
            }

            const resample = characteristic.resample;
            const time = (resample.hours * 60 * 60) + (resample.minutes * 60) + resample.seconds;

            writes.push(write({
                peripheralUUID: peripheral.UUID,
                serviceUUID: SENSOR_SERVICE_ID,
                characteristicUUID: characteristic.UUID,
                value: "0x" + time.toString(16)
            }));
        }

        this.zone.run(() => {
        }); // Force page refresh, for some reason it doesn't naturally update here.

        let typeIds = [];

        for (let key in NOTIFY_CHARACTERISTICS) {
            typeIds.push(NOTIFY_CHARACTERISTICS[key]);
        }

        this.api.createDevice({
            deviceId: peripheral.UUID,
            typeIds: typeIds
        });

        Promise.all(writes).then(() => {
            this.subscribe(peripheral);
        }, () => {
            this.subscribe(peripheral);
        });
    }

    public onDisconnected(peripheral: UWEPeripheral): void {
        // Clear all running tasks for this peripheral, if any exist.
        if (peripheral.tasks) {
            peripheral.tasks.forEach(taskId => {
                clearInterval(taskId);
            });
        }

        peripheral.connecting = false;
        this.connectingIds.delete(peripheral.UUID);

        let wasConnected: boolean = deletePeripheral(this.connectedPeripherals, peripheral.UUID);

        if (wasConnected) {
            addPeripheral(this.disconnectedKnownPeripherals, peripheral);
            alert("Disconnected from " + peripheral.name);
        }

        this.zone.run(() => {
        }); // Force page refresh, for some reason it doesn't naturally update here.
    }

    public subscribe(peripheral: UWEPeripheral): void {
        const service: UWEService = getUWESenseService(peripheral);

        for (let i = 0; i < service.characteristics.length; i++) {
            const characteristic: UWECharacteristic = service.characteristics[i];
            const characteristicId: string = characteristic.UUID.toLowerCase();
            const typeId: string = NOTIFY_CHARACTERISTICS[characteristicId];

            if (!typeId) {
                continue;
            }

            // iOS seems to automatically disconnect from devices when
            // subscribing to notifications. So here we're polling for data
            // updates instead. Other platforms should stick with the more power
            // efficient notifications.
            if (platformModule.isIOS) {
                // Calculate the duration to resample the characteristic in milliseconds.
                const resample = characteristic.resample;
                const resampleMillis = ((resample.hours * 60 * 60) + (resample.minutes * 60) + resample.seconds) * 1000;

                // Define reading state, prevents multiple reads at the same time.
                let reading = false;

                // Create the device poll task, manually requesting data once
                // every user-configured epoch.
                const taskId = setInterval(() => {
                    // Do nothing if already reading from characteristic.
                    if (reading) return;

                    // Begin reading from the characteristic.
                    reading = true;
                    read({
                        peripheralUUID: peripheral.UUID,
                        serviceUUID: service.UUID,
                        characteristicUUID: characteristicId
                    }).then(result => {
                        // Fully read in the result, and send to DataUnity.
                        this.onNotify(peripheral, typeId, result);
                        reading = false; // We're finished reading.
                    });
                }, resampleMillis);

                // Assign task to the peripheral, in the event we wish to cancel
                // this task later.
                if (!peripheral.tasks) {
                    peripheral.tasks = [taskId];
                } else {
                    peripheral.tasks.push(taskId);
                }
            } else {
                startNotifying({
                    peripheralUUID: peripheral.UUID,
                    serviceUUID: service.UUID,
                    characteristicUUID: characteristicId,
                    onNotify: (result: ReadResult) => this.onNotify(peripheral, typeId, result)
                }).then(() => {
                    console.log("Notifications subscribed");
                });
            }
        }
    }

    public onNotify(peripheral: UWEPeripheral, typeId: string, result: ReadResult): void {
        const length = new Uint8Array(result.value)[2];
        const payload = new Uint8ClampedArray(result.value, 3, length);
        let value: number = 0;

        for (let i = 0; i < length; i++) {
            value <<= 8;
            value += payload[i];
        }

        console.log("Received data for " + typeId + " : " + value);

        const reading: SensorReading = {
            session: this.api.getCurrentSession(),
            deviceId: peripheral.UUID,
            typeId: typeId,
            timestamp: new Date(),
            data: value
        };

        this.api.submitReading(reading);
    }
}

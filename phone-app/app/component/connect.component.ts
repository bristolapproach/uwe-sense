import {Component, NgZone, OnInit} from "@angular/core";
import * as bluetooth from "nativescript-bluetooth";
import {TextDecoder} from "text-encoding";
import {ApiService, SensorReading} from "../app.service";
import {RouterExtensions} from "nativescript-angular";
import {
    DEFAULT_RESAMPLE_RATE,
    NOTIFY_CHARACTERISTICS,
    SCAN_DURATION_SECONDS,
    SENSOR_SERVICE_ID
} from "../configuration";
import {File, knownFolders} from "tns-core-modules/file-system";
import {addPeripheral, deletePeripheral, findPeripheral, getUWESenseService} from "../util";

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./connect.component.html",
})
export class ConnectComponent implements OnInit {

    private scanning: boolean = false;
    private scanningText: string = "Scanning";
    private disconnectedKnownPeripherals = [];
    private disconnectedPeripherals = [];
    private connectedPeripherals = [];
    private connectingIds = new Set();
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
            bluetooth.disconnect({UUID: peripheral.UUID});
        }

        this.routerExtensions.navigate(["/session"], {clearHistory: true});
    }

    public addNote(): void {
        this.routerExtensions.navigate(["/note"], {clearHistory: false});
    }

    public configure(peripheral: bluetooth.Peripheral): void {
        const params = {
            peripheralId: peripheral.UUID,
            peripheralName: peripheral.name
        };

        this.routerExtensions.navigate(["/peripheral", params], {clearHistory: false});
    }

    public scan(): void {
        if (this.scanning) {
            alert("You are already scanning!");
            return;
        }

        bluetooth.hasCoarseLocationPermission().then(granted => {
            if (granted) {
                return Promise.resolve();
            } else {
                return bluetooth.requestCoarseLocationPermission();
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

            return bluetooth.startScanning({
                serviceUUIDs: [SENSOR_SERVICE_ID],
                seconds: SCAN_DURATION_SECONDS,
                onDiscovered: this.onDiscovered
            });
        }).then(() => {
            this.scanning = false;
            alert("Scan complete, " + this.devicesFound + " devices found.");
        }, error => {
            this.scanning = false;
            alert("Scanning error: " + error);
        });
    }

    public onDiscovered(peripheral) {
        if (findPeripheral(this.disconnectedKnownPeripherals, peripheral.UUID)) {
            this.connect(peripheral, true);
            this.devicesFound++;
            return;
        }

        if (!findPeripheral(this.disconnectedPeripherals, peripheral.UUID)) {
            this.disconnectedPeripherals.push(peripheral);
            this.devicesFound++;
            return;
        }
    }

    public connect(peripheral: any, msg: boolean): void {
        if (this.connectingIds.has(peripheral.UUID)) {
            alert("Already connecting to " + peripheral.name);
            return;
        }

        this.connectingIds.add(peripheral.UUID);
        peripheral.connecting = true;
        bluetooth.connect({
            UUID: peripheral.UUID,
            onConnected: peripheral => this.onConnected(peripheral, msg),
            onDisconnected: () => this.onDisconnected(peripheral)
        });
    }

    public onConnected(peripheral: bluetooth.Peripheral, sendMessage: boolean): void {
        if (sendMessage) {
            alert("Connected to " + peripheral.name);
        }

        // Save peripherals.
        const tempPeripheral = findPeripheral(this.disconnectedKnownPeripherals, peripheral.UUID);

        if (tempPeripheral != null) {
            peripheral = tempPeripheral;
        }

        deletePeripheral(this.disconnectedKnownPeripherals, peripheral.UUID);
        deletePeripheral(this.disconnectedPeripherals, peripheral.UUID);
        addPeripheral(this.connectedPeripherals, peripheral);

        const serializedPeripherals = JSON.stringify(Array.from(this.connectedPeripherals.concat(this.disconnectedKnownPeripherals)));

        this.knownPeripheralsFile.writeText(serializedPeripherals).then(() => {
            console.log("Successfully saved known devices to file");
        });

        const service = getUWESenseService(peripheral);

        if (service == null) {
            bluetooth.disconnect({UUID: peripheral.UUID});
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

            writes.push(bluetooth.write({
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

    public onDisconnected(peripheral: any): void {
        peripheral.connecting = false;
        this.connectingIds.delete(peripheral.UUID);

        deletePeripheral(this.connectedPeripherals, peripheral.UUID);
        addPeripheral(this.disconnectedKnownPeripherals, peripheral);

        this.zone.run(() => {
        }); // Force page refresh, for some reason it doesn't naturally update here.

        alert("Disconnected from " + peripheral.name);
    }

    public subscribe(peripheral): void {
        const service = getUWESenseService(peripheral);

        for (let i = 0; i < service.characteristics.length; i++) {
            const characteristicId: string = service.characteristics[i].UUID;
            const typeId = NOTIFY_CHARACTERISTICS[characteristicId];

            if (!typeId) {
                continue;
            }

            bluetooth.startNotifying({
                peripheralUUID: peripheral.UUID,
                serviceUUID: service.UUID,
                characteristicUUID: characteristicId,
                onNotify: result => this.onNotify(peripheral, typeId, result)
            }).then(() => {
                console.log("Notifications subscribed");
            });
        }
    }

    public onNotify(peripheral, typeId, result): void {
        const data = new Uint8Array(result.value);
        const value = data[1];
        console.log("Received data for " + typeId + ": " + value);

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

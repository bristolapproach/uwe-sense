import {Component, OnInit} from "@angular/core";
import {TextDecoder} from "text-encoding";
import {ActivatedRoute} from "@angular/router";
import * as bluetooth from "nativescript-bluetooth";
import * as dialogs from "ui/dialogs";
import {RouterExtensions} from "nativescript-angular";
import {ListPicker} from "tns-core-modules/ui/list-picker";
import {CONFIG_FOLDER, DEFAULT_RESAMPLE_RATE, NOTIFY_CHARACTERISTICS, SENSOR_SERVICE_ID} from "../configuration";
import {findPeripheral, getCharacteristic, getUWESenseService} from "../util";
import {UWECharacteristic, UWEPeripheral, UWEService} from "../interfaces";
import {File} from "tns-core-modules/file-system";
import {ApiService} from "../app.service";

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./peripheral.component.html",
})
export class PeripheralComponent implements OnInit {

    private updating: boolean = false;
    private peripheralId: string;
    private peripheral: UWEPeripheral;
    private service: UWEService;
    private knownPeripherals: UWEPeripheral[] = [];
    private knownPeripheralsFile: File;

    // noinspection JSMismatchedCollectionQueryUpdate
    private characteristics: UWECharacteristic[] = [];
    // noinspection JSUnusedLocalSymbols
    private zeroToSixty = Array(60).fill(1, 61).map((x, i) => i);
    // noinspection JSUnusedLocalSymbols
    private zeroToTwentyFour = Array(24).fill(1, 25).map((x, i) => i);

    constructor(private routerExtensions: RouterExtensions,
                private route: ActivatedRoute,
                private api: ApiService) {
        this.peripheralId = route.snapshot.params["peripheralId"];
    }

    ngOnInit(): void {
        this.knownPeripheralsFile = CONFIG_FOLDER.getFile("known-peripherals.json");
        this.knownPeripheralsFile.readText().then(content => {
            if (!content) {
                return;
            }

            this.knownPeripherals = JSON.parse(content);
            this.peripheral = findPeripheral(this.knownPeripherals, this.peripheralId);
            this.service = getUWESenseService(this.peripheral);

            if (this.service == null) {
                return;
            }

            for (let id in NOTIFY_CHARACTERISTICS) {
                const characteristic = getCharacteristic(this.service, id);

                if (!NOTIFY_CHARACTERISTICS.hasOwnProperty(id) ||
                    characteristic == null) {
                    continue;
                }

                if (!characteristic.hasOwnProperty("resample")) {
                    characteristic.resample = DEFAULT_RESAMPLE_RATE;
                }

                characteristic["friendlyName"] = NOTIFY_CHARACTERISTICS[id];

                this.characteristics.push(characteristic);
            }
        });
    }

    update(): void {
        this.updating = true;

        for (let i = 0; i < this.service.characteristics.length; i++) {
            const characteristic = this.service.characteristics[i];

            if (!NOTIFY_CHARACTERISTICS.hasOwnProperty(characteristic.UUID)) {
                continue;
            }

            const resample = characteristic.resample;
            const time = (resample.hours * 60 * 60) + (resample.minutes * 60) + resample.seconds;

            bluetooth.write({
                peripheralUUID: this.peripheral.UUID,
                serviceUUID: SENSOR_SERVICE_ID,
                characteristicUUID: characteristic.UUID,
                value: "0x" + time.toString(16)
            });
        }

        const serializedPeripherals = JSON.stringify(Array.from(this.knownPeripherals));

        this.knownPeripheralsFile.writeText(serializedPeripherals).then(() => {
            dialogs.alert("Device successfully updated").then(() => {
                this.routerExtensions.back();
            });
            console.log("Successfully saved known devices to file");
        });

        this.updating = false;
    }

    back(): void {
        this.routerExtensions.back();
    }

    unregister(): void {
        dialogs.confirm({
            title: "Unregister " + this.peripheral.name,
            message: "Deleting device, would you like to purge its history?",
            okButtonText: "Yes",
            cancelButtonText: "No",
            neutralButtonText: "Cancel"
        }).then(response => {
            if (response === undefined) {
                return Promise.reject(false);
            }
            return Promise.resolve();

            // const unregisterDevicePacket: UnregisterDevice = {
            //     deviceId: this.peripheralId,
            //     purgeData: response
            // };
            //
            // return this.api.unregisterDevice(unregisterDevicePacket);
        }).then(() => {
            for (let i = 0; i < this.knownPeripherals.length; i++) {
                if (this.knownPeripherals[i].UUID == this.peripheral.UUID) {
                    this.knownPeripherals.splice(i, 1);
                }
            }

            const serializedPeripherals = JSON.stringify(Array.from(this.knownPeripherals));
            return this.knownPeripheralsFile.writeText(serializedPeripherals);
        }).then(() => {
            bluetooth.disconnect({UUID: this.peripheral.UUID});
            return dialogs.alert("Device successfully unregistered");
        }).then(() => {
            this.routerExtensions.back();
        }, error => {
            if (!error) {
                return;
            }

            alert("Device deletion failed: " + error);
        });
    }

    public changeHours(args, id) {
        const picker = <ListPicker>args.object;
        const characteristic = getCharacteristic(this.service, id);

        if (characteristic.resample == null) {
            characteristic.resample = DEFAULT_RESAMPLE_RATE;
        }

        characteristic.resample.hours = picker.selectedIndex;
    }

    public changeMinutes(args, id) {
        const picker = <ListPicker>args.object;
        const characteristic: UWECharacteristic = getCharacteristic(this.service, id);

        if (characteristic.resample == null) {
            characteristic.resample = DEFAULT_RESAMPLE_RATE;
        }

        characteristic.resample.minutes = picker.selectedIndex;
    }

    public changeSeconds(args, id) {
        const picker = <ListPicker>args.object;
        const characteristic = getCharacteristic(this.service, id);

        if (characteristic.resample == null) {
            characteristic.resample = DEFAULT_RESAMPLE_RATE;
        }

        characteristic.resample.seconds = picker.selectedIndex;
    }
}

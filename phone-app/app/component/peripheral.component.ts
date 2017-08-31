import {Component, OnInit} from "@angular/core";
import {TextDecoder} from "text-encoding";
import {ApiService} from "../app.service";
import {ActivatedRoute} from "@angular/router";
import * as bluetooth from "nativescript-bluetooth";
import * as dialogs from "ui/dialogs";
import * as fileSystem from "file-system";
import {RouterExtensions} from "nativescript-angular";
import {ListPicker} from "tns-core-modules/ui/list-picker";
import {DEFAULT_RESAMPLE_RATE, NOTIFY_CHARACTERISTICS, SENSOR_SERVICE_ID} from "../configuration";

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./peripheral.component.html",
})
export class PeripheralComponent implements OnInit {

    private updating: boolean = false;
    private peripheral;
    private service;
    private knownPeripherals = [];
    private knownPeripheralsFile;
    private characteristics = [];

    // noinspection JSUnusedLocalSymbols
    private zeroToSixty = Array(60).fill(1, 61).map((x, i) => i);
    // noinspection JSUnusedLocalSymbols
    private zeroToTwentyFour = Array(24).fill(1, 25).map((x, i) => i);

    constructor(private routerExtensions: RouterExtensions,
                private route: ActivatedRoute,
                private api: ApiService) {
        this.peripheral = {
            UUID: route.snapshot.params["peripheralId"],
            name: route.snapshot.params["peripheralName"]
        };
    }

    ngOnInit(): void {
        this.knownPeripheralsFile = fileSystem.knownFolders.currentApp().getFile("known-peripherals.json");
        this.knownPeripheralsFile.readText().then(content => {
            if (!content) {
                return;
            }

            this.knownPeripherals = JSON.parse(content);
            console.log("KNOWN PER: " + JSON.stringify(this.knownPeripherals));
            this.peripheral = PeripheralComponent.findPeripheral(this.knownPeripherals, this.peripheral.UUID);
            this.service = PeripheralComponent.getUWESenseService(this.peripheral);

            if (this.service == null) {
                return;
            }

            for (let id in NOTIFY_CHARACTERISTICS) {
                const characteristic = PeripheralComponent.getCharacteristic(this.service, id);

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
                value: '0x' + time.toString(16)
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

    unregister(): void {
        dialogs.confirm({
            title: "Unregister " + this.peripheral.name,
            message: "Are you sure you wish to unregister this device?",
            okButtonText: "Yes",
            cancelButtonText: "No",
            neutralButtonText: "Cancel"
        }).then(response => {
            if (!response) {
                return;
            }

            for (let i = 0; i < this.knownPeripherals.length; i++) {
                if (this.knownPeripherals[i].UUID == this.peripheral.UUID) {
                    this.knownPeripherals.splice(i, 1);
                }
            }

            const serializedPeripherals = JSON.stringify(Array.from(this.knownPeripherals));
            console.log("WRITING: " + serializedPeripherals);
            this.knownPeripheralsFile.writeText(serializedPeripherals).then(value => {
                console.log("WRITE SUCCESS: " + value);
            });

            bluetooth.disconnect({UUID: this.peripheral.UUID});

            dialogs.alert("Device successfully unregistered").then(() => {
                this.routerExtensions.back();
            });
        });
    }

    public changeHours(args, id) {
        let picker = <ListPicker>args.object;
        const characteristic = PeripheralComponent.getCharacteristic(this.service, id);

        if (characteristic["resample"] == null) {
            characteristic["resample"] = {};
        }

        characteristic["resample"]["hours"] = picker.selectedIndex;
    }

    public changeMinutes(args, id) {
        let picker = <ListPicker>args.object;
        const characteristic = PeripheralComponent.getCharacteristic(this.service, id);

        if (characteristic["resample"] == null) {
            characteristic["resample"] = {};
        }

        characteristic["resample"]["minutes"] = picker.selectedIndex;
    }

    public changeSeconds(args, id) {
        let picker = <ListPicker>args.object;
        const characteristic = PeripheralComponent.getCharacteristic(this.service, id);

        if (characteristic["resample"] == null) {
            characteristic["resample"] = {};
        }

        characteristic["resample"]["seconds"] = picker.selectedIndex;
    }

    static findPeripheral(peripherals: any[], uuid: string) {
        for (let peripheral of peripherals) {
            if (peripheral.UUID == uuid) {
                return peripheral;
            }
        }
        return null;
    }

    static getUWESenseService(peripheral) {
        for (let i = 0; i < peripheral.services.length; i++) {
            const service = peripheral.services[i];

            if (service.UUID == SENSOR_SERVICE_ID) {
                return service;
            }
        }
        return null;
    }

    static getCharacteristic(service, characteristicId) {
        for (let i = 0; i < service.characteristics.length; i++) {
            const characteristic = service.characteristics[i];
            if (characteristic.UUID == characteristicId) {
                return characteristic;
            }
        }
        return null;
    }
}

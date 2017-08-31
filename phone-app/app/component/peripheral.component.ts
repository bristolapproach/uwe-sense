import {Component, OnInit} from "@angular/core";
import {TextDecoder} from "text-encoding";
import {ApiService} from "../app.service";
import {ActivatedRoute} from "@angular/router";
import * as bluetooth from "nativescript-bluetooth";
import * as dialogs from "ui/dialogs";
import * as fileSystem from "file-system";
import {RouterExtensions} from "nativescript-angular";
import {ListPicker} from "tns-core-modules/ui/list-picker";
import {SENSOR_SERVICE_ID} from "../configuration";

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./peripheral.component.html",
})
export class PeripheralComponent implements OnInit {

    private updating: boolean = false;
    private peripheral;
    private knownPeripherals = [];
    private knownPeripheralsFile;

    private seconds;
    private minutes;
    private hours;

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
        });
    }

    update(): void {
        this.updating = true;

        const time = (this.hours * 60 * 60) + (this.minutes * 60) + this.seconds;

        // bluetooth.write({
        //     peripheralUUID: this.peripheral.UUID,
        //     serviceUUID: SENSOR_SERVICE_ID,
        //     characteristicUUID: SENSOR_CHARACTERISTIC_WRITE_ID,
        //     value: '0x' + time.toString(16)
        // }).then(() => {
        //     dialogs.alert("Device successfully updated").then(() => {
        //         this.routerExtensions.back();
        //     });
        // }, error => {
        //     console.log(error);
            dialogs.alert("Device update failed").then(() => {
                this.routerExtensions.back();
            });
        // });

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

            // TODO: Unregister the device.
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

    public changeHours(args) {
        let picker = <ListPicker>args.object;
        this.hours = picker.selectedIndex;
    }

    public changeMinutes(args) {
        let picker = <ListPicker>args.object;
        this.minutes = picker.selectedIndex;
    }

    public changeSeconds(args) {
        let picker = <ListPicker>args.object;
        this.seconds = picker.selectedIndex;
    }
}

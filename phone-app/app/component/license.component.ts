import {Component, OnInit} from "@angular/core";
import {TextDecoder} from "text-encoding";
import {ApiService} from "../app.service";
import {RouterExtensions} from "nativescript-angular";
import {exit} from "nativescript-exit";
import {license} from "../license";
import * as fs from "tns-core-modules/file-system";
const platformModule = require("tns-core-modules/platform");

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./license.component.html",
})
export class LicenseComponent implements OnInit {

    private license: string = license;

    constructor(private routerExtensions: RouterExtensions,
                private api: ApiService) {
    }

    public ngOnInit(): void {
        const app = fs.knownFolders.currentApp();
        const path = fs.path.join(app.path, ".eula");

        // Do nothing if eula already agreed to, or we're not running iOS. Users
        // on other platforms will still need to agree to the EULA with a popup
        // view instead. This module was created to overcome the ugliness of iOS
        // popups.
        if (fs.File.exists(path) || !platformModule.isIOS) {
            this.goLogin();
            return;
        }
    }

    public acceptLicense(): void {
        // Create the eula file.
        const app = fs.knownFolders.currentApp();
        app.getFile(".eula");
        this.goLogin();
    }

    public goLogin(): void {
        this.routerExtensions.navigate(["/login"], {clearHistory: true});
    }

    public denyLicense(): void {
        exit();
    }
}

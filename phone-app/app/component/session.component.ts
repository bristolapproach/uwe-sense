import {Component, OnInit} from "@angular/core";
import {TextDecoder} from "text-encoding";
import {ApiService} from "../app.service";
import {RouterExtensions} from "nativescript-angular";
import * as geolocation from "nativescript-geolocation";
import firebase = require("nativescript-plugin-firebase");

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./session.component.html",
})
export class SessionComponent implements OnInit {

    private locationEnabled: boolean = false;
    private loggingOut: boolean = false;

    constructor(private routerExtensions: RouterExtensions,
                private api: ApiService) {
    }

    ngOnInit(): void {
        this.locationEnabled = this.api.isLocationEnabled();
    }

    startSession(): void {
        this.api.startNewSession();
        this.routerExtensions.navigate(['/connect'], {clearHistory: true});
    }

    toggleLocationTracking(): void {
        if (this.locationEnabled) {
            this.locationEnabled = false;
            this.api.setLocationEnabled(false);
        } else {
            if (!geolocation.isEnabled()) {
                geolocation.enableLocationRequest(true);
            }

            this.locationEnabled = true;
            this.api.setLocationEnabled(true);
        }
    }

    goAbout(): void {
        const params = {page: "/session"};
        this.routerExtensions.navigate(['/about', params], {clearHistory: true});
    }

    logout(): void {
        this.loggingOut = true;
        firebase.logout().then(() => {
            this.routerExtensions.navigate(['/login'], {clearHistory: true}).then(() => {
                alert("Successfully logged out!")
            });
        });
    }
}

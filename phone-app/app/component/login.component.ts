import {Component, OnInit} from "@angular/core";
import {TextDecoder} from "text-encoding";
import {ApiService} from "../app.service";
import {RouterExtensions} from "nativescript-angular";
import {confirm} from "ui/dialogs";
import {license} from "../license";
import {exit} from "nativescript-exit";
import * as fs from "tns-core-modules/file-system";
import {configFolder} from "../configuration";
import firebase = require("nativescript-plugin-firebase");

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./login.component.html",
})
export class LoginComponent implements OnInit {

    private static fireBaseInitComplete: boolean = false;
    private loginStatus: string = "";
    private loggingIn: boolean = false;
    private account: firebase.User;

    constructor(private routerExtensions: RouterExtensions,
                private api: ApiService) {
    }

    public ngOnInit(): void {
        const path = fs.path.join(configFolder().path, ".eula");

        if (fs.File.exists(path)) {
            return;
        }

        confirm({
            title: "License Agreement",
            message: license,
            okButtonText: "Accept",
            cancelButtonText: "Deny",
            neutralButtonText: "Cancel"
        }).then(function (result) {
            if (!result) {
                exit();
                return;
            }

            configFolder().getFile(".eula");
        });
    }

    public goAbout(): void {
        const params = {page: "/login"};
        this.routerExtensions.navigate(["/about", params], {clearHistory: true});
    }

    public login() {
        // Do nothing if user is already logging in.
        if (this.loggingIn) {
            alert("Already logging in");
            return;
        }

        // Update the login status.
        this.loginStatus = "Initializing";
        this.loggingIn = true;

        // Initialize FireBase.
        LoginComponent.initFireBase().then(() => {

            // Login via Google.
            this.loginStatus = "Logging in";
            LoginComponent.fireBaseInitComplete = true;
            return firebase.login({type: firebase.LoginType.GOOGLE});

        }).then((account: firebase.User) => {

            // Fetch the FireBase authentication token.
            this.loginStatus = "Fetching authentication token";
            this.account = account;
            return firebase.getAuthToken({forceRefresh: true});

        }).then((token: string) => {

            // Authenticate with DataUnity using the token.
            this.loginStatus = "Authenticating";
            return this.api.authenticate(token);

        }).then(() => {

            // Navigate to the "session" page.
            this.loginStatus = "Complete";
            return this.routerExtensions.navigate(["/session"], {clearHistory: true});

        }).then(() => {

            // Alert the user if their login was a success.
            this.loggingIn = false;
            alert("Successfully logged in as " + this.account.name);

        }, error => {

            // Alert the user if an error occurred.
            this.loggingIn = false;
            console.log(new Date() + ": Failed to login - " + error);
            alert("Failed to login:\n\n" + error);

        });
    }

    public static initFireBase(): Promise<void> {
        if (LoginComponent.fireBaseInitComplete) {
            return Promise.resolve();
        }

        return firebase.init({});
    }
}

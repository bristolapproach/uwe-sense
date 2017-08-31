import {Component, OnInit} from "@angular/core";
import {TextDecoder} from "text-encoding";
import {ApiService} from "../app.service";
import {RouterExtensions} from "nativescript-angular";
import firebase = require("nativescript-plugin-firebase");

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./login.component.html",
})
export class LoginComponent implements OnInit {

    private loginStatus: string = "";
    private loggingIn: boolean = false;
    private fireBaseInitComplete: boolean = false;
    private account: firebase.User;

    constructor(private routerExtensions: RouterExtensions,
                private api: ApiService) {
    }

    public ngOnInit(): void {
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
        this.initFireBase().then(() => {

            // Login via Google.
            this.loginStatus = "Logging in";
            this.fireBaseInitComplete = true;
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
            alert("Failed to login: " + error);

        });
    }

    public initFireBase(): Promise<void> {
        if (this.fireBaseInitComplete) {
            return Promise.resolve();
        }

        return firebase.init({});
    }
}

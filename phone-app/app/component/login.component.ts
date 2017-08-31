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

    constructor(private routerExtensions: RouterExtensions,
                private api: ApiService) {
    }

    goAbout(): void {
        const params = {page: "/login"};
        this.routerExtensions.navigate(['/about', params], {clearHistory: true});
    }

    ngOnInit(): void {
    }

    public login() {
        if (this.loggingIn) {
            alert("Already logging in");
            return;
        }

        this.loggingIn = true;
        this.loginStatus = "Initializing";

        this.initFirebase(() => {
            this.loginStatus = "Logging in";
            firebase.login({type: firebase.LoginType.GOOGLE}).then(account => {
                this.loginStatus = "Fetching authentication token";
                firebase.getAuthToken({forceRefresh: true}).then(token => {
                    this.loginStatus = "Authenticating";
                    this.api.authenticate(token, () => {
                        this.loginStatus = "Complete";
                        this.routerExtensions.navigate(['/session'], {clearHistory: true}).then(() => {
                            this.loggingIn = false;
                            alert("Successfully logged in as " + account.name);
                        });
                    }, error => {
                        alert("Failed to login: " + error);
                    });
                });
            }, error => {
                alert("Failed to login: " + error);
            });
        });
    }

    public initFirebase(callback: () => any) {
        if (this.fireBaseInitComplete) {
            callback();
            return;
        }

        firebase.init({}).then(() => {
            this.fireBaseInitComplete = true;
            callback();
        }, () => {
            callback();
        });
    }
}

import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import {enableLocationRequest, getCurrentLocation, isEnabled} from "nativescript-geolocation";
import {CreateDevice, LocationData, Note, SensorReading, UnregisterDevice, UWEPeripheral} from "./interfaces";
import * as https from "nativescript-https";
const nsHttp = require("http");
const platformModule = require("tns-core-modules/platform");

@Injectable()
export class ApiService {

    private baseUrl: string = "https://citizensensing.dataunity.org";
    private authenticateUrl: string = this.baseUrl + "/citizen-sensing/authenticate-user-jwt?provider=firebase";
    private dataPublishingUrl: string = this.baseUrl + "/citizen-sensing/device-data-publishing";
    private createDeviceUrl: string = this.baseUrl + "/citizen-sensing/register-device-with-hardware-id";
    // TODO: Currently a dummy endpoint.
    private unregisterDeviceUrl: string = this.baseUrl + "/citizen-sensing/unregister-device-with-hardware-id";
    private authorisationJwt: string = "";
    private token: string = "";
    private locationEnabled: boolean = false;
    private session: Date;
    private httpModule = nsHttp;

    constructor() {
      if (platformModule.isAndroid) {
          this.httpModule = https;
      } else {
          this.httpModule = nsHttp;
      }
    }

    public isLocationEnabled(): boolean {
        return this.locationEnabled;
    }

    public setLocationEnabled(enabled: boolean): void {
        this.locationEnabled = enabled;
    }

    public startNewSession(): void {
        this.session = new Date();
    }

    public getCurrentSession(): Date {
        return this.session;
    }

    public authenticate(token: string): Promise<string> {
        console.log("Sending authentication token: " + token);

        this.token = token;

        return this.httpModule.request({
            method: "POST",
            url: this.authenticateUrl,
            content: token,
            headers: {},
        }).then(response => {
            const message = "(" + response.statusCode + ") " + response.content.toString();
            this.authorisationJwt = response.content.toString();

            if (response.statusCode < 400) {
                return Promise.resolve(message);
            }

            return Promise.reject(message);
        });
    }

    public createDevice(data: CreateDevice): Promise<string> {
        const headers = {
            "Authorization": "Bearer " + this.authorisationJwt,
            "Content-Type": "application/json"
        };

        console.log("Sending create device: " + JSON.stringify(data));

        return this.httpModule.request({
            method: "POST",
            url: this.createDeviceUrl,
            headers: headers,
            content: JSON.stringify(data)
        }).then(response => {
            const message = "(" + response.statusCode + ") " + response.content.toString();
            console.log("Device creation response: " + message);

            if (response.statusCode == 401) {
                return this.authenticate(this.token).then(() => {
                    return this.createDevice(data);
                });
            }

            if (response.statusCode < 400) {
                return Promise.resolve(message);
            }

            return Promise.reject(message);
        });
    }

    public submitReading(data: SensorReading): Promise<string> {
        const headers = {
            "Authorization": "Bearer " + this.authorisationJwt,
            "Content-Type": "application/json"
        };

        return this.addLocation(data).then(() => {
            console.log("Sending sensor reading: " + JSON.stringify(data));
            return this.httpModule.request({
                method: "POST",
                url: this.dataPublishingUrl,
                headers: headers,
                content: JSON.stringify(data)
            });
        }).then(response => {
            const message = "(" + response.statusCode + ") " + response.content.toString();
            console.log("Reading submission response: " + message);

            if (response.statusCode == 401) {
                return this.authenticate(this.token).then(() => {
                    return this.submitReading(data);
                });
            }

            if (response.statusCode < 400) {
                return Promise.resolve(message);
            }

            return Promise.reject(message);
        });
    }

    public submitNote(data: Note): Promise<string> {
        const headers = {
            "Authorization": "Bearer " + this.authorisationJwt,
            "Content-Type": "application/json"
        };

        return this.addLocation(data).then(() => {
            console.log("Sending note: " + JSON.stringify(data));
            return this.httpModule.request({
                method: "POST",
                url: this.dataPublishingUrl,
                headers: headers,
                content: JSON.stringify(data)
            });
        }).then(response => {
            const message = "(" + response.statusCode + ") " + response.content.toString();
            console.log("Note submission response: " + response.content.toString());

            if (response.statusCode == 401) {
                return this.authenticate(this.token).then(() => {
                    return this.submitNote(data);
                });
            }

            if (response.statusCode < 400) {
                return Promise.resolve(message);
            }

            return Promise.reject(message);
        });
    }

    private addLocation(data: LocationData): Promise<void> {
        if (!this.locationEnabled) {
            return Promise.resolve();
        }

        if (!isEnabled()) {
            return enableLocationRequest(true).then(() => {
                return getCurrentLocation({});
            }).then(location => {
                data.location = location;
            });
        }

        return getCurrentLocation({}).then(location => {
            data.location = location;
        });
    }

    public unregisterDevice(data: UnregisterDevice): Promise<string> {
        const headers = {
            "Authorization": "Bearer " + this.authorisationJwt,
            "Content-Type": "application/json"
        };

        console.log("Sending unregister device: " + JSON.stringify(data));

        return this.httpModule.request({
            method: "POST",
            url: this.unregisterDeviceUrl,
            headers: headers,
            content: JSON.stringify(data)
        }).then(response => {
            const message = "(" + response.statusCode + ") " + response.content.toString();
            console.log("Device unregister response: " + message);

            if (response.statusCode == 401) {
                return this.authenticate(this.token).then(() => {
                    return this.unregisterDevice(data);
                });
            }

            if (response.statusCode < 400) {
                return Promise.resolve(message);
            }

            return Promise.reject(message);
        });
    }
}

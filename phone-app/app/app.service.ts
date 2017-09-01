import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import {enableLocationRequest, getCurrentLocation, isEnabled} from "nativescript-geolocation";
import {CreateDevice, LocationData, Note, SensorReading} from "./interfaces";

const http = require("http");

@Injectable()
export class ApiService {

    private baseUrl: string = "http://ec2-35-166-177-195.us-west-2.compute.amazonaws.com:8080";
    private authenticateUrl: string = this.baseUrl + "/citizen-sensing/authenticate-user-jwt?provider=firebase";
    private dataPublishingUrl: string = this.baseUrl + "/citizen-sensing/device-data-publishing";
    private createDeviceUrl: string = this.baseUrl + "/citizen-sensing/register-device-with-hardware-id";
    private authorisationJwt: string = "";
    private token: string = "";
    private locationEnabled: boolean = false;
    private session: Date;

    constructor() {
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

    public authenticate(token: string): Promise<void> {
        console.log("Sending authentication token: " + token);

        this.token = token;

        return http.request({
            method: "POST",
            url: this.authenticateUrl,
            content: token
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

        return http.request({
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
            return http.request({
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
            return http.request({
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

        getCurrentLocation({}).then(location => {
            data.location = location;
        });
    }
}

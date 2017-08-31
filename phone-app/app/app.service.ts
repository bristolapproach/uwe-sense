import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import * as geolocation from "nativescript-geolocation";

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

    public setLocationEnabled(enabled: boolean) {
        this.locationEnabled = enabled;
    }

    public startNewSession(): void {
        this.session = new Date();
    }

    public getCurrentSession(): Date {
        return this.session;
    }

    authenticate(token: string, successCallback: (success: string) => any, errorCallback: (error: string) => any): void {
        const headers = {};
        this.token = token;

        console.log("Sending authentication token: " + token);

        http.request({
            method: "POST",
            url: this.authenticateUrl,
            headers: headers,
            content: token
        }).then(response => {
            console.log("Token: " + response.content.toString());
            this.authorisationJwt = response.content.toString();
            successCallback(response);
        }, error => {
            console.log("Error occurred: " + error);
            errorCallback(error);
        });
    }

    createDevice(data: CreateDevice): void {
        const headers = {
            "Authorization": "Bearer " + this.authorisationJwt,
            "Content-Type": "application/json"
        };

        console.log("Sending create device: " + JSON.stringify(data));

        http.request({
            method: "POST",
            url: this.createDeviceUrl,
            headers: headers,
            content: JSON.stringify(data)
        }).then(response => {
            console.log("Device creation response: " + response.content.toString());

            if (response.statusCode == 401) {
                this.authenticate(this.token, () => {
                    this.createDevice(data);
                }, () => {
                    alert("Authentication failure, data was lost");
                });
            }
        }, error => {
            console.log("Device creation error: " + error);
        });
    }

    submitReading(data: SensorReading): void {
        const headers = {
            "Authorization": "Bearer " + this.authorisationJwt,
            "Content-Type": "application/json"
        };

        this.addLocation(data, () => {
            console.log("Sending sensor reading: " + JSON.stringify(data));
            http.request({
                method: "POST",
                url: this.dataPublishingUrl,
                headers: headers,
                content: JSON.stringify(data)
            }).then(response => {
                console.log("Reading submission response: " + response.content.toString());

                if (response.statusCode == 401) {
                    this.authenticate(this.token, () => {
                        this.submitReading(data);
                    }, () => {
                        alert("Authentication failure, data was lost");
                    });
                }
            }, error => {
                console.log("Reading submission error: " + error);
            });
        });
    }

    submitNote(data: Note): void {
        const headers = {
            "Authorization": "Bearer " + this.authorisationJwt,
            "Content-Type": "application/json"
        };

        this.addLocation(data, () => {
            console.log("Sending note: " + JSON.stringify(data));
            http.request({
                method: "POST",
                url: this.dataPublishingUrl,
                headers: headers,
                content: JSON.stringify(data)
            }).then(response => {
                console.log("Note submission response: " + response.content.toString());

                if (response.statusCode == 401) {
                    this.authenticate(this.token, () => {
                        this.submitNote(data);
                    }, () => {
                        alert("Authentication failure, data was lost");
                    });
                }
            }, error => {
                console.log("Note submission error: " + error);
            });
        });
    }

    private addLocation(data: LocationData, callback: () => any) {
        if (!this.locationEnabled) {
            callback();
            return;
        }

        if (!geolocation.isEnabled()) {
            geolocation.enableLocationRequest(true).then(() => {
                geolocation.getCurrentLocation({}).then(location => {
                    data.location = location;
                    callback();
                }, () => {
                    callback();
                });
            }, () => {
                callback();
            });
        }

        geolocation.getCurrentLocation({}).then(location => {
            data.location = location;
            callback();
        }, () => {
            callback();
        });
    }
}

export interface CreateDevice {
    deviceId: string;
    typeIds: string[];
}

export interface LocationData {
    location?: geolocation.Location;
}

export interface SensorReading extends LocationData {
    session: Date;
    deviceId: string;
    typeId: string;
    timestamp: Date;
    data: number;
}

export interface Note extends LocationData {
    session: Date;
    text: string;
    timestamp: Date;
}

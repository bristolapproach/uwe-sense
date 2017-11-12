import {Component} from "@angular/core";
import {TextDecoder} from "text-encoding";
import {ActivatedRoute} from "@angular/router";
import {RouterExtensions} from "nativescript-angular";
import {ApiService} from "../app.service";
import * as platformModule from "tns-core-modules/platform";

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./dataunity.component.html",
})
export class DataUnityComponent {

    private height: number = platformModule.screen.mainScreen.heightPixels / 4;

    constructor(private routerExtensions: RouterExtensions,
                private route: ActivatedRoute,
                private api: ApiService) {
    }

    back(): void {
        this.routerExtensions.back();
    }
}

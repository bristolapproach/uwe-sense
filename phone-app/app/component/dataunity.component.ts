import {Component} from "@angular/core";
import {TextDecoder} from "text-encoding";
import {ActivatedRoute} from "@angular/router";
import {RouterExtensions} from "nativescript-angular";
import {ApiService} from "../app.service";
import * as platformModule from "tns-core-modules/platform";
import {WebViewUtils} from 'nativescript-webview-utils';
import {WebView} from 'tns-core-modules/ui/web-view';
import * as observable from 'tns-core-modules/data/observable';

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

    applyUserAgent(args: observable.EventData) {
        const webView: WebView = <WebView>args.object;
        WebViewUtils.setUserAgent(webView, "Mozilla/5.0 Google");
    }
}

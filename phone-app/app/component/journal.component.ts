import {Component} from "@angular/core";
import {TextDecoder} from "text-encoding";
import {RouterExtensions} from "nativescript-angular";
import * as platformModule from "tns-core-modules/platform";
import {WebViewUtils} from 'nativescript-webview-utils';
import {WebView} from 'tns-core-modules/ui/web-view';
import * as observable from 'tns-core-modules/data/observable';

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./journal.component.html",
})
export class JournalComponent {

    private height: number = platformModule.screen.mainScreen.heightPixels / 4;

    constructor(private routerExtensions: RouterExtensions) {
    }

    back(): void {
        this.routerExtensions.back();
    }

    applyUserAgent(args: observable.EventData) {
        const webView: WebView = <WebView>args.object;
        WebViewUtils.setUserAgent(webView, "Mozilla/5.0 Google");
    }
}

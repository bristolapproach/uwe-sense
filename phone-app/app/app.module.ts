import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import {NativeScriptModule} from "nativescript-angular/nativescript.module";
import {AppRoutingModule, routes} from "./app.routing";
import {AppComponent} from "./app.component";

import {ConnectComponent} from "./component/connect.component";
import {ApiService} from "./app.service";
import {PeripheralComponent} from "./component/peripheral.component";
import {LoginComponent} from "./component/login.component";
import {NativeScriptRouterModule} from "nativescript-angular";
import {AboutComponent} from "./component/about.component";
import {SessionComponent} from "./component/session.component";
import {NoteComponent} from "./component/note.component";
import {DataUnityComponent} from "./component/dataunity.component";
import {JournalComponent} from "./component/journal.component";
import {LicenseComponent} from "./component/license.component";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        AppRoutingModule,
        NativeScriptModule,
        NativeScriptRouterModule,
        NativeScriptRouterModule.forRoot(routes)
    ],
    declarations: [
        AppComponent,
        LicenseComponent,
        LoginComponent,
        SessionComponent,
        AboutComponent,
        ConnectComponent,
        NoteComponent,
        PeripheralComponent,
        DataUnityComponent,
        JournalComponent
    ],
    providers: [
        ApiService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule {
}

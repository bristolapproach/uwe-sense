import {NgModule} from "@angular/core";
import {NativeScriptRouterModule} from "nativescript-angular/router";
import {Routes} from "@angular/router";

import {ConnectComponent} from "./component/connect.component";
import {PeripheralComponent} from "./component/peripheral.component";
import {LoginComponent} from "./component/login.component";
import {AboutComponent} from "./component/about.component";
import {SessionComponent} from "./component/session.component";
import {NoteComponent} from "./component/note.component";
import {DataUnityComponent} from "./component/dataunity.component";
import {JournalComponent} from "./component/journal.component";
import {LicenseComponent} from "./component/license.component";

export const routes: Routes = [
    {path: "", redirectTo: "/license", pathMatch: "full"},
    {path: "license", component: LicenseComponent},
    {path: "login", component: LoginComponent},
    {path: "session", component: SessionComponent},
    {path: "about", component: AboutComponent},
    {path: "connect", component: ConnectComponent},
    {path: "note", component: NoteComponent},
    {path: "peripheral", component: PeripheralComponent},
    {path: "dataunity", component: DataUnityComponent},
    {path: "journal", component: JournalComponent}
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule {
}

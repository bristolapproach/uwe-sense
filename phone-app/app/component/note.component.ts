import {Component, OnInit} from "@angular/core";
import {TextDecoder} from "text-encoding";
import {ApiService, Note} from "../app.service";
import {RouterExtensions} from "nativescript-angular";

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./note.component.html",
})
export class NoteComponent implements OnInit {

    private note: string = "";

    constructor(private routerExtensions: RouterExtensions,
                private api: ApiService) {
    }

    ngOnInit(): void {
    }

    public submit(): void {
        const info: Note = {
            session: this.api.getCurrentSession(),
            text: this.note,
            timestamp: new Date()
        };

        this.api.submitNote(info);
        this.routerExtensions.back();
        alert("Note successfully created!");
    }

    public back(): void {
        this.routerExtensions.back();
    }

    public updateNote(event) {
        this.note = event.value;
    }
}

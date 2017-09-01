import {Component, OnInit} from "@angular/core";
import {TextDecoder} from "text-encoding";
import {ApiService} from "../app.service";
import {RouterExtensions} from "nativescript-angular";
import {Note} from "../interfaces";

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
        const note: Note = {
            session: this.api.getCurrentSession(),
            text: this.note,
            timestamp: new Date()
        };

        this.api.submitNote(note).then(() => {
            this.routerExtensions.back();
            alert("Note successfully created!");
        }, error => {
            alert("Note creation failed:\n\n" + error);
        });
    }

    public back(): void {
        this.routerExtensions.back();
    }

    public updateNote(event) {
        this.note = event.value;
    }
}

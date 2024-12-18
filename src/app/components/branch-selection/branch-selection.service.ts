import { Injectable, signal, WritableSignal } from "@angular/core";
import { Branch } from "../../models/branch.model";

@Injectable({ providedIn: 'root' })
export class BranchSelectionService {
    public branchesOption: WritableSignal<Branch[]> = signal([]);
}
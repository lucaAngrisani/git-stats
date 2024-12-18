import { MapClass, MapInterface } from "mapper-factory";
import { Stats } from "./stats.model";

@MapClass()
export class Commit {
    id!: string;

    author_email!: string;
    author_name!: string;

    created_at!: string;

    stats!: Stats;
}

export interface Commit extends MapInterface<Commit> { }
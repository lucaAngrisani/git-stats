import { Injectable } from '@angular/core';

@Injectable({
    providedIn: "root"
})
export class StorageService {

    private _obj: any;
    private _item: any;

    constructor() { }

    /************************/
    /* save item{key, obj}  */
    /************************/
    public save<T>(key: string, object: T) {
        localStorage.setItem(key, JSON.stringify(object));
    }

    /************************/
    /* load item by key     */
    /************************/
    public load(key: string) {
        this._obj = null;
        this._item = localStorage.getItem(key);
        if (this._item != null) {
            this._obj = JSON.parse(this._item);
        }
        return this._obj;
    }

    /************************/
    /* set string by key     */
    /************************/
    public set(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    /************************/
    /* get string by key     */
    /************************/
    public get(key: string) {
        this._obj = null;
        this._item = localStorage.getItem(key);
        return this._item;
    }

    /************************/
    /* remove item by key   */
    /************************/
    public remove(key: string) {
        localStorage.removeItem(key);
    }

}
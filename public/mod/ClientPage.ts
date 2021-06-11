
import {MenuBar, MenuLink} from "./MenuClient.js";
import {PageData, PageDataMenu} from "./PageData.js"
import * as $ from "./Dom.js";
import Cookies from "./Cookies.js";

export class LocalStorage
{
    name: string;
    constructor(name) {
        this.name=name;
        this.load();
    }
    load()
    {
        let str=localStorage.getItem(this.name);
        let obj=JSON.parse(str);
        Object.assign(this,obj);
    }
    save()
    {
        let str=JSON.stringify(this);
        localStorage.setItem(this.name,str);

    }
}
class StorageData
{
}
type StorageDataC=(new () => StorageData);

export class PageClientT<STATIC_DATA extends PageData> {

    staticData: STATIC_DATA;
    elm_main: HTMLElement;
    elm_header: HTMLElement;
    cookies = Cookies;
    storage =new StorageData();
    storageName = "Page";

    storageLoad(objDest: Object = null) {
        if (!objDest)
            objDest = this.storage;
        let str = localStorage.getItem(this.storageName);
        let obj = JSON.parse(str);
        objDest = Object.assign(objDest, obj);
    }
    storageSave(objSource: Object = null) {
        if (!objSource)
            objSource = this.storage;
        let str = JSON.stringify(objSource);
        localStorage.setItem(this.storageName, str);
    }
    constructor(staticData) {

        this.staticData=staticData;
        //Object.assign(this.staticData, staticData);
        window["page"] = this;
        window.onload = () => {
            this.run();
        }
        this.storageName = window.location.pathname;
        this.elm_main = $.id('main');
        //console.log("client page constructor");

    }

    run() {
        console.log("client page default run");
    }

}


// @ts-ignore
export function PageClient<STATIC_DATA extends PageData >(  StaticDataT:(new () => STATIC_DATA) = PageData,
) {
    return class extends PageClientT<STATIC_DATA>{
    }
}


export class PageClientMenuT<STATIC_DATA extends PageDataMenu = PageDataMenu> extends PageClientT<STATIC_DATA>
{
        menubar : MenuBar;
        constructor(staticData: Partial<STATIC_DATA>) {
            console.log("PageClientMenu constructor");
            super(staticData);
            this.menubar =new MenuBar(staticData.menubar);
        }
    }


// @ts-ignore
export function PageClientMenu<STATIC_DATA extends PageDataMenu>(   StaticDataT: (new ()=>STATIC_DATA)   = PageDataMenu) {
    return class extends PageClientMenuT<STATIC_DATA>
    {
    }
}


export default  PageClientMenu()

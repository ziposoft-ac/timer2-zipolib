
import * as IM from "./IMenu.js";


export interface Pwa
{
    precache: string; //=  "precache-v1";
    runtime: string; //= "runtime";
    precache_urls: string[]; //=[];
}

export class PageData
{


}


export class PageDataMenu extends PageData
{
    menubar : IM.IMenuBar= {type:IM.Type.MenuBar, id: "topmenu",label:"menu",items:[]};

}
export class PageDataApp extends PageData
{

}


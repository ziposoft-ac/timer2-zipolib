import * as IM from "/zs_client/IMenu";
import {ISelect} from "/zs_client/IMenu";



export function Menu(id :string,label: string,access: IM.AccessLevel, items :  IM.IBase[]) : IM.IMenu
{
    return {type:IM.Type.Menu,id,label,items,access};
}


export function Link(text: string,link:string,access: IM.AccessLevel=IM.AccessLevel.Anon) : IM.ILink
{
    return {type:IM.Type.MenuLink,id:null,label:text,link:link,access:access};
}
export function BoolCookie(label: string,cookeName:string) : IM.IBool
{
    return {type:IM.Type.MenuBoolCookie,id:null,
        label:label, key:cookeName};
}



export enum Type {
    Menu = 'Menu',
    MenuLink = 'MenuLink',
    MenuBar = 'MenuBar',
    MenuFunc = 'MenuFunc',
    MenuBool = 'MenuBool',
    MenuBoolCookie = 'MenuBoolCookie',
}
export interface IBase
{
    type? : string;
    id? : string;
    label : string;
    getLabel? : ()=>string;


}
export interface ISelect extends IBase {
    options : Object;
    default: string;
    onChange? :  (value)=> any;

}
export interface ISelectVal extends IBase {

    value : any;
    parent ?: object;//MenuSelect
}
export interface ILink extends IBase {
    link : string;
}
export interface IFunc extends IBase {
    func :  ()=> any;
}
export interface IPageFuncName extends IBase {
    funcName : string;
}
export interface IPageFunc extends IBase {
    func : any;
}
export interface IMenu extends IBase {
    items?: IBase[];
}
export interface IMenuBar extends IMenu {
}
export interface IEdit<T> extends IBase {
   // onChange :  (value:T)=> any;
    inputType?: string;
    getValue? : ()=> T;
    setValue? : (T)=> void;
}
export interface INumberEdit extends IEdit<number> {
    decimalPlaces: number;
}
export interface ITextEdit extends  IEdit<string> {
}
export interface IBool extends IBase {
    onChange? :  (value)=> any;
    default: boolean;
}

export interface IBoolCookie extends IBool {
    cookeName:string;
}

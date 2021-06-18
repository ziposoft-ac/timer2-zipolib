

export class ZNode<T>
{
    e : T;
    constructor(elm:T) {
        this.e=elm;
    }

}
export function value(elementID:string) : string
{
    return input(elementID).value;
}
export function input(elementID:string) : HTMLInputElement
{
    let i= document.getElementById(elementID);
    if('value' in i) return <HTMLInputElement>i;
    console.log(`Error. ${elementID} is not an input element`);
    return null;
}
export function type<T extends HTMLElement>(elementID:string) : T
{
    return <T>document.getElementById(elementID);
}
export function id(elementID:string) : HTMLElement
{
    return document.getElementById(elementID);
}
export function zode<T>(elementID:string) : ZNode<T>
{
    let elm=<T><unknown>document.getElementById(elementID);
    return  new ZNode<T>(elm)
}

interface Elements extends NodeListOf<HTMLElement>
{
    clear();
}
interface HTMLElementEx extends HTMLElement
{
    clear();
    val(value?);
    valNum(value?:number): number;

}
export function create<K extends keyof HTMLElementTagNameMap>(tagName: K,cl:string=null,id:string=null): HTMLElementTagNameMap[K]
{
    let e: HTMLElementTagNameMap[K]= document.createElement(tagName);
    if(cl) e.className=cl;
    if(id) e.id=id;
    return e;
}





export function all(s:string) : Elements
{
  return  <Elements> document.querySelectorAll(s );
}


HTMLElement.prototype["clear"] = function ():string {
    if("value" in this)
    {
        return this.value="";
    }
};
HTMLElement.prototype["val"] = function (valin:string):string {

    if("value" in this)
    {
        if(valin)
            this.value=valin;
        return this.value;
    }
    console.log("no value?:",this.value);
    return "";
};
HTMLElement.prototype["valNum"] = function (valin:number):number {
    if("value" in this)
    {
        if(valin)
            this.value=valin;
        return Number(this.value);
    }
};

NodeList.prototype["clear"] = function () {
    this['forEach'](function (el) {
        if(el.value)
            el.value="";
    });
    return this;
};

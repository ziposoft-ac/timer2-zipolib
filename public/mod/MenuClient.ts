

import * as IM from "./IMenu.js";
import Cookies from "./js.cookie.js";
import {PageClientMenu, PageClientMenuT} from "./ClientPage.js"
import {IInput} from "./IMenu.js";
console.log("MenuClient module");


abstract class MenuBase
{
    label:string;
    id:string;
    parent:Menu;
    value:any=null;
    constructor(
        public props: IM.IBase) {
        if(!props.key)
            props.key="";
        this.id=props.id;
        this.label=props.label;

    }
    render() : HTMLElement
    {
        return null;
    }
    abstract setText(txt:string);

    updateDisplay()
    {
        if(this.props.getLabel)
        {
            this.props.getLabel();

        }
    }
    onClick(ev:MouseEvent) {

    }
    onMouseOver(ev:MouseEvent)  { }
    onMouseOut(ev:MouseEvent) {  }
    dataSet(val):boolean
    {
        if(this.props.setValue)
        {
            this.props.setValue(val);
            return true;
        }
        if(this.props.key)
        {
            this.parent.dataSetKey(this.props.key,val);
            return true;

        }
        this.value=val;
        return false;
    }
    dataGet() : any{
        if(this.props.getValue)
            return this.props.getValue();
        if(this.props.key)
            return  this.parent.dataGetKey(this.props.key);
        return this.value;
    }
    clientCreateItems( parent : MenuBase,item_list:  IM.IBase[],level:number=0)
    {
        for( let item of item_list )
        {
            let mobj=null;
            if(item.type)
            {
                let cl=registry[item.type];
                if(cl)
                {
                    mobj= new cl(item);
                }
                else
                    console.log("Unknown menu type:",item.type);
            }
            else
            {
                if(item instanceof MenuBase)
                    mobj=item;
            }
            if(mobj)
                parent.addItem(mobj);
            else
                console.log("cannot create menu item:",item);

        }
    }
    addItem(item : MenuBase)
    {
    }
    addItems(...items :MenuBase[])
    {
        for(let item of items)
            this.addItem(item);
    }
}
class MenuItem extends MenuBase
{
    elm : ElmMenuItem;
    constructor(props: IM.IBase) {
        super(props);
        this.elm=new ElmMenuItem(this);
    }
    render() : ElmMenuItem
    {
        return this.elm;
    }
    setText(txt:string)
    {
        this.elm.setText(txt);
    }

}
export class Menu extends MenuBase
{
    protected children : MenuBase[]=[];
    menu_elm : ElmMenu;
    constructor(props: IM.IMenu ) {
        super(props);
        this.menu_elm=new ElmMenu(this);
        if(props.items) // props for
            this.clientCreateItems(this,props.items);
        if(props.dataGetKey) this.dataGetKey=props.dataGetKey;
        if(props.dataSetKey) this.dataSetKey=props.dataSetKey;
    }
    dataSetKey(key:string,val:any){}
    dataGetKey(key:string):any { return null; }
    updateDisplay()
    {
        super.updateDisplay();
        for(let i of this.children)
        {
            try {
                i.updateDisplay();

            }
            catch (e)
            {
                console.log(e);
            }

        }
    }
    addItem(item : MenuBase)
    {
        this.children.push(item);
        item.parent=this;
        let child_elm=item.render();
        this.menu_elm.div.appendChild(child_elm);
    }
    clearItems()
    {
        let d=this.menu_elm.div;
        this.children=[];
        while (d.firstChild)  d.removeChild(d.firstChild);
    }
    render() : HTMLElement
    {
        return this.menu_elm;
    }
    setText(txt:string)
    {
        this.menu_elm.setText(txt);
    }
}
export class MenuBar extends MenuBase
{
    elm :ElmMenuBar =null;
    protected children : MenuBase[]=[];
    setText(txt:string)
    {
    }
    updateDisplay()
    {
        super.updateDisplay();
        for(let i of this.children)
            i.updateDisplay();
    }
    addItem(item : MenuBase)
    {
        this.children.push(item);

        let child_elm=item.render();
        this.elm.divTop.appendChild(child_elm);
    }
    constructor(props:IM.IMenuBar)
    {
        super(props);
        this.elm=<ElmMenuBar>document.getElementById(props.id);
        this.elm.bind(this);
        if(props.items) // props for
            this.clientCreateItems(this,props.items);
    }


}
export class MenuSelectItem extends MenuItem
{
    value: any;
    parent: MenuSelect;
    constructor(props: IM.ISelectVal ) {
        super(props);
        this.value=props.value;
        this.parent=<MenuSelect>props.parent;

    }
    onClick(ev:MouseEvent)
    {
        this.parent.callbackSelect(this);
    }
    select(selected : boolean)
    {
        this.elm.setText(this.props.label+(selected ? "✓":" "));
    }
}



export class MenuSelect extends Menu
{
    currentSelection : MenuSelectItem;
    options : object;
    baseName: string;
    props: IM.ISelect;
    selectItems ={};

    updateDisplay()
    {
        let key=this.dataGet();

        if(this.currentSelection)
            this.currentSelection.select(false);
        let item=this.selectItems[key]
        let selectLabel="none";
        if(item)
        {
            item.select(true);
            this.currentSelection=item;
            selectLabel=this.currentSelection.label;
        }


        let label=(this.props.getLabel?
            this.props.getLabel() :
            this.baseName+" : "+selectLabel);

        this.label=label;
        this.menu_elm.name=label;
        this.menu_elm.a.text=label;
    }
    callbackSelect(item:MenuSelectItem)
    {
        this.dataSet(item.value);
        this.updateDisplay();
    }
    constructor(props: IM.ISelect ) {
        super(props);


        this.menu_elm=new ElmMenu(this);
        this.options=props.options;
        this.baseName=this.label;
        for(let key in this.options)
        {
            let item=new MenuSelectItem({label:this.options[key], value:key,parent:this});
            this.addItem(item);
            this.selectItems[key]=item;
        }
    }

}
export class MenuInput extends MenuItem
{
    props : IM.IInput;

    editbox: HTMLInputElement;
    editMode=false;

    updateDisplay()
    {
        let label=(this.props.getLabel?this.props.getLabel(): this.props.label);
        this.elm.setText(label+":");
    }
    constructor(props ) {
        super(props);

        let eb = document.createElement("input");
        eb.autocomplete="on";

        this.editbox=eb;
        this.elm.classList.add("textedit");
        this.elm.appendElm(eb);
        eb.onchange=(event)=>{this.onChange(event) };
    }
    onChange(event)
    {
    }


}
export class MenuTextEdit extends MenuInput
{
    props : IM.ITextEdit;
    constructor(props : IM.ITextEdit) {
        super(props);
        this.editbox.type="label";
    }

    updateDisplay()
    {
        super.updateDisplay();
        this.editbox.value=this.dataGet();
    }
    onChange(event)
    {
        this.dataSet(this.editbox.value);

    }


}
export class MenuNumberEdit extends MenuInput
{
    updateDisplay()
    {
        super.updateDisplay();
        let value=this.dataGet();
        if (typeof value === 'number') {
            value=value.toFixed(this.props.decimalPlaces);
        }
        this.editbox.value=value;
    }

    props : IM.INumberEdit;
    constructor(props : IM.INumberEdit) {
        super(props);
        if(!props.decimalPlaces)
            props.decimalPlaces=0;

        this.editbox.type="number";
    }
    onChange(event)
    {
        let value=parseInt(this.editbox.value);
        this.dataSet(value);

    }
}


export class MenuBool extends MenuItem
{
    props : IM.IBool;
    constructor(props : IM.IBool) {
        super(props);
    }
    state : boolean=false;
    updateDisplay()
    {
        super.updateDisplay();
        let state=this.dataGet();
        this.elm.setText(this.label+(state ? "✓":" "));
    }
    onClick(ev:MouseEvent)
    {
        let state=!this.dataGet();
        this.dataSet(state);
        this.updateDisplay();

    }

}



export class MenuLink extends MenuItem
{
    constructor(props : IM.ILink) {
        super(props);
        this.elm.innerHTML=`<a href="${props.link}">${props.label}</a>`;
    }
}

export class MenuBoolCookie extends MenuBool
{
    dataSet(val)
    {
        if(val)
            Cookies.set(this.props.key,"true");
        else
        {
            Cookies.remove(this.props.key);
        }
        return true;
    }
    dataGet() : any{
        return Cookies.get(this.props.key)!=undefined ;

    }

}
export class MenuFunc extends MenuItem
{
    func :  ()=> any;
    constructor(props : IM.IFunc) {
        super(props);
        this.func=props.func;

    }
    onClick(ev:MouseEvent)
    {
        this.func();
    }

}

export class MenuPageFunc extends MenuFunc
{
    func :  ()=> any;
    constructor(props : IM.IPageFunc) {
        let page: typeof PageClientMenu=globalThis["page"];

        let func=props.func.bind(page);
        super({...props,...{ func: func}});

    }


}

export class ElmMenuBase extends HTMLElement
{
    menu_obj: MenuBase=null;
    constructor(menu_obj:MenuBase) {
        super();
        if(menu_obj)
            this.bind(menu_obj);

    }
    bind(menu_obj:MenuBase)
    {
        this.menu_obj=menu_obj;
        this.ontouchend=(ev)=>{this.onTouch(ev);}
        this.onclick=(ev)=>{this.onClick(ev);}
        this.onmouseover=(ev)=>{this.onMouseOver(ev);}
        this.onmouseout=(ev)=>{this.onMouseOut(ev);}
    }
    onTouch(ev:TouchEvent)
    {
        console.log("onTouch");
       // ev.stopPropagation();

    }
    onClick(ev:MouseEvent)
    {
        //this.onMouseOut(ev);
        this.menu_obj.onClick(ev);
    }
    onMouseOver(ev:MouseEvent)
    {
        this.menu_obj.onMouseOver(ev);
    }
    onMouseOut(ev:MouseEvent)
    {
        this.menu_obj.onMouseOut(ev);

    }
}
export class ElmMenuItem extends ElmMenuBase
{
    private a : HTMLAnchorElement;
    private label: HTMLElement;
    constructor(menuItem:MenuItem) {
        super(menuItem);
        let a = document.createElement("a");
        let span = document.createElement("span");

        if(menuItem.props.id)
            a.id=menuItem.props.id;
        a.href="#";
        this.appendChild(a);
        a.appendChild(span);
        this.a=a;
        this.label=span;
        this.setText(menuItem.label)
    }
    appendElm(elm)
    {
        this.a.appendChild(elm);
    }
    setText(txt:string)
    {
        this.label.innerText=txt;
    }
    create(props)
    {

    }
}

export class ElmMenu extends ElmMenuBase
{
    expanded=false;
    div : HTMLDivElement;
    a : HTMLAnchorElement;
    name :string;
    protected shown:boolean=false;
    constructor(menu: Menu) {
        super(menu);

        this.div = document.createElement("div");
        //this.classList.add("menusub");
        this.a = document.createElement("a");

        this.name=menu.props.label;
        this.classList.add("menushow");
        this.classList.add("menusub");
        this.appendChild(this.a);
        this.appendChild(this.div);
        this.onMouseOut(null);

    }
    setText(txt:string)
    {
        this.name=txt;
    }
    onTouch(ev:TouchEvent)
    {
        /*
        ev.stopPropagation();

        ev.preventDefault();
        if(this.expanded)
            this.onMouseOut(null);
        else
            this.onMouseOver(null);
*/
    }
    onMouseOver(ev:MouseEvent)
    {

        this.classList.remove("menuhide");
        this.classList.add("menushow");
        this.a.textContent = `${this.name} ▼`; //►
        this.expanded=true;
    }
    onMouseOut(ev:MouseEvent)
    {
        this.classList.replace("menushow","menuhide");
        this.a.textContent = `${this.name} ►`; //►
        this.expanded=false;

    }
    onClick(ev:MouseEvent)
    {
        console.log("menu onClick:",ev['expanded']);

        super.onClick(ev);
        if(this.expanded)
        {
            console.log("menu onClick expanded");

            //this.onMouseOut(ev);
        }
    }
    create(props)
    {

    }
};
export class ElmMenuBar extends ElmMenuBase
{

    divMobile : HTMLDivElement;
    divTop : HTMLDivElement;
    constructor(menu: Menu) {
        super(menu);

        this.divMobile = document.createElement("div");
        this.divMobile.textContent = `☰MENU`; //►

        this.divTop = document.createElement("div");
        this.divMobile.classList.add("zs_menu_mobile");
        this.classList.add("barhide");
        this.divTop.classList.add("zs_menu_top");
        this.appendChild(this.divMobile);
        this.appendChild(this.divTop);

    }
    onMouseOver(ev:MouseEvent)
    {
        this.classList.remove("barhide");
        this.classList.add("barshow");
    }
    onMouseOut(ev:MouseEvent)
    {
        this.classList.replace("barshow","barhide");

    }

};

export var registry={
    Menu : Menu,
    MenuLink : MenuLink,
    MenuBar : MenuBar,
    MenuFunc : MenuFunc,
    MenuBool : MenuBool,
    MenuBoolCookie: MenuBoolCookie
};

customElements.define('zs-menuitem', ElmMenuItem,);
customElements.define('zs-menu', ElmMenu);
customElements.define('zs-menubar', ElmMenuBar);

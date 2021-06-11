

import * as IM from "./IMenu.js";
import Cookies from "./js.cookie.js";
import {PageClientMenu, PageClientMenuT} from "./ClientPage.js"
console.log("MenuClient module");


abstract class MenuBase
{
    label:string;
    id:string;
    constructor(
        public props: IM.IBase) {
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
    onClick(ev:MouseEvent) {}
    onMouseOver(ev:MouseEvent)  { }
    onMouseOut(ev:MouseEvent) {  }

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
        this.elm.appendChild(child_elm);
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
    value : any;
    baseName: string;
    props: IM.ISelect;
    selectItems ={};
    setValue(key)
    {
        let item=this.selectItems[key];
        if(item)
        {
            this.setItem(item);
        }
    }
    callbackSelect(item:MenuSelectItem)
    {
        if(this.props.onChange)
            this.props.onChange(item.value);
        this.setItem(item);
    }
    setItem(item:MenuSelectItem)
    {
        if(this.currentSelection)
            this.currentSelection.select(false);
        item.select(true);
        this.currentSelection=item;
        this.value=item.value;
        this.label= this.baseName+" : "+item.label;
        this.menu_elm.name=this.label;
        this.menu_elm.a.text=this.label;

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
        this.setValue(props.default);
    }

}
export class MenuInput extends MenuItem
{
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
        this.updateDisplay();
    }
    value : string="default";
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
        this.updateDisplay();

    }
    updateDisplay()
    {
        super.updateDisplay();
        this.editbox.value=this.props.getValue().toString();
    }
    onChange(event)
    {
        this.value=this.editbox.value;
        this.props.setValue(this.value);

    }


}
export class MenuNumberEdit extends MenuInput
{
    updateDisplay()
    {
        super.updateDisplay();
        this.editbox.value=this.props.getValue().toFixed(this.props.decimalPlaces);
    }

    props : IM.INumberEdit;
    constructor(props : IM.INumberEdit) {
        super(props);
        this.editbox.type="number";
        this.updateDisplay();
    }
    onChange(event)
    {
        let value=parseInt(this.editbox.value);
        this.props.setValue(value);
    }
}


export class MenuBool extends MenuItem
{
    props : IM.IBool;
    constructor(props : IM.IBool) {
        super(props);
        this.state=props.default;
        this.updateCheckmark();
    }
    state : boolean=false;
    updateCheckmark()
    {
        this.elm.setText(this.label+(this.state ? "✓":" "));
    }
    onClick(ev:MouseEvent)
    {
        this.state=!this.state;
        this.props.onChange(this.state);

        this.updateCheckmark();
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
    cookeName:string;
    constructor(props : IM.IBoolCookie) {
        super(props);
        this.cookeName=props.cookeName;

        this.state=Cookies.get(this.cookeName)!=undefined ;
        console.log("MenuBoolCookie construct: ",this.state,props.cookeName);
        this.updateCheckmark();
    }
    onClick(ev:MouseEvent)
    {
        this.state=!this.state;

        this.updateCheckmark();
        if(this.state)
            Cookies.set(this.cookeName,"true");
        else
        {
            console.log("MenuBoolCookie remove");

            Cookies.remove(this.cookeName);

        }

        console.log("MenuBoolCookie: ",this.state,this.cookeName);

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
        this.onclick=(ev)=>{menu_obj.onClick(ev);}
        this.onmouseover=(ev)=>{this.onMouseOver(ev);}
        this.onmouseout=(ev)=>{this.onMouseOut(ev);}
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
    onMouseOver(ev:MouseEvent)
    {
        this.classList.remove("menuhide");
        this.classList.add("menushow");
        this.a.textContent = `${this.name} ▼`; //►

    }
    onMouseOut(ev:MouseEvent)
    {
        this.classList.replace("menushow","menuhide");
        this.a.textContent = `${this.name} ►`; //►
    }
    create(props)
    {

    }
};
export class ElmMenuBar extends ElmMenuBase
{





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

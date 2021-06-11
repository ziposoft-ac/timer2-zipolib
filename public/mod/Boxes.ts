import * as $ from "/zs_client/Dom.js";


const animateDelay=200;

export class ElmBoxList extends HTMLElement
{
    shown: boolean=false;
    items: ElmBox[]=[];
    #_expanded=false;
    title: string="title";
    head : HTMLDivElement;
    get expanded() { return this.#_expanded }
    set expanded(val:boolean)
    {
        console.log("list expand=",val);
        this.#_expanded=val;
        if(val) {
            this.classList.remove('contract');

            this.classList.add('expand');
        }
        else
        {
            this.classList.add('contract');
            this.classList.remove('expand');
        }
    }
    constructor(expanded=false) {
        super();
        this.#_expanded=expanded;
        this.head = document.createElement("div");
        this.head.innerText= this.title;
    }
    connectedCallback() {
        this.expanded=this.#_expanded;
    }
    contract(animate=false)
    {
        console.log("list contract");

        this.items.forEach((i)=>i.hide());
                this.expanded=false;

    }
    expand(animate=false)
    {
        this.expanded=true;

            this.items.forEach((i)=>i.show());


        this.shown=true;
    }
    moveToEnd(item:ElmBox)
    {

    }
    add(item:ElmBox)
    {
        if(this.expanded || (!this.items.length))
            item.show();
        else

            item.hide();
        this.items.push(item);
        this.appendChild(item);
    }
    bind(menu_obj)
    {
        this.onclick=(ev)=>{menu_obj.onClick(ev);}
        this.onmouseover=(ev)=>{this.onMouseOver(ev);}
        this.onmouseout=(ev)=>{this.onMouseOut(ev);}
    }
    onMouseOver(ev:MouseEvent)
    {
    }
    onMouseOut(ev:MouseEvent)
    {

    }
}
export class ElmBox extends HTMLElement
{
    expanded=false;
    shown=false;
    list : ElmBoxList=null;
    head : HTMLDivElement;
    img : HTMLImageElement;

    constructor(text: string,url:string=null) {
        super();
        this.head = document.createElement("div");
        //this.list = <ElmBoxList>document.createElement("zs-boxlist");
        this.appendChild(this.head);
        this.head.innerText= text;


        if(url)
        {
            this.img = document.createElement("img");
            this.appendChild(this.img);
            this.img.src=url;
        }

        this.onmouseover=(ev)=>{return this.onMouseOver(ev);}
        this.onmouseout=(ev)=>{this.onMouseOut(ev);}
        this.onclick=(ev)=>{return this.onClick(ev);}
        this.className="box_contract";
    }
    connectedCallback() {

    }
    add(item: ElmBox)
    {
        if(!this.list)
        {
            this.list = new ElmBoxList();
            this.appendChild(this.list);
        }
        this.list.add(item);
    }
    expand()
    {

        // Move to end?
        //let parent=<ElmBoxList>this.parentElement;
        //parent.appendChild(this);
        setTimeout(()=>{
                this.className="box_expand";
                this.expanded=true;
                this.img.scrollIntoView({behavior:"smooth",block:"center"})
            },     10);
        if(this.list) setTimeout(()=>{ this.list.expand(); }, 200);

    }
    hide()
    {
        console.log("box hide");

        this.className="box_hide";
        this.expanded=false;
        this.shown=false;
    }
    show()
    {
        this.className="box_contract";
        this.expanded=false;
        this.shown=true;
    }
    contract()
    {
        console.log("box contract");



        setTimeout(()=>{
                if(this.list)
                    this.list.contract();
                this.className="box_contract";
                this.expanded=false;
            },
            1)

    }
    onClick(ev:MouseEvent)
    {
        console.log("box click");
        ev.stopPropagation();
        if(this.expanded)
            this.contract();
        else
            this.expand();
        return false;
    }
    onMouseOver(ev:MouseEvent)
    {
    }
    onMouseOut(ev:MouseEvent)
    {

    }
}
export class ElmBoxImage extends ElmBox
{

    constructor(text: string,url:string) {
        super(text,url);

    }

}


customElements.define('zs-boximg', ElmBoxImage);
customElements.define('zs-box', ElmBox);
customElements.define('zs-boxlist', ElmBoxList);


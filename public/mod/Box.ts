import * as $ from "/zs_client/Dom.js";
import {ElmBox} from "/zs_client/Boxes";


const animateDelay=300;


export interface IBox
{

}
export class Box
{
    elm : HTMLDivElement;
    elmTitle : HTMLDivElement;
    title="";
    expanded=false;
    level=1;

    shown=false;
    preview=false;
    parent: BoxList=null;
    constructor(parent:BoxList,title:string,shown=true,expand=false) {

        this.parent=parent;
        if(parent)
        {
            this.level=parent.level+1;
        }

        this.elm = document.createElement("div");
        this.title=title;

        this.elm.onmouseover=(ev)=>{return this.onMouseOver(ev);}
        this.elm.onmouseout=(ev)=>{this.onMouseOut(ev);}
        this.elm.onclick=(ev)=>{return this.onClick(ev);}
        this.elm.className="zs_box";
        this.elm.classList.add('lvl'+this.level);

        //this.titlewrap=$.create("div","zs_box_header");
        //this.titlewrap.appendChild(this.title);
        this.elmTitle=$.create("div");

        this.elmTitle.textContent=title;

        this.elm.appendChild(this.elmTitle);

        this.setShow(shown);
        this.setExpand(expand);

    }
    private setShow(shown:boolean)
    {
        this.shown=shown;
        if(shown)
        {
            this.elm.classList.remove('boxhide');
        }
        else
        {
            this.elm.classList.add('boxhide');
        }
    }
    private setExpand(expanded:boolean)
    {
        this.expanded=expanded;
        if(expanded)
        {
            this.elm.classList.remove('contract');
            this.elm.classList.add('expand');
        }
        else
        {
            this.elm.classList.add('contract');
            this.elm.classList.remove('expand');
        }
    }
    setLeveL(lvl:number)
    {
        this.level=lvl;

    }
    show(shown:boolean)
    {
        this.setShow(shown);
    }
    expand(expanded:boolean)
    {
        this.setExpand(expanded);

    }
    toggle()
    {

        this.expand(!this.expanded);

    }
    onClick(ev:MouseEvent)
    {
        console.log("Box click");
        //ev.stopPropagation();
        //this.toggle();
        return false;
    }
    onMouseOver(ev:MouseEvent)
    {
    }
    onMouseOut(ev:MouseEvent)
    {

    }

}
export class BoxList extends Box
{
    items: Box[]=[];
    constructor(parent:BoxList,title: string,shown=true,expanded=false,id:string=null) {
        super(parent,title,shown,expanded);

        this.elm.classList.add("zs_box_list");
        this.elmTitle.className="zs_box_header";
        this.elmTitle.classList.add('header'+this.level)
        if(id)
            this.elm.id=id;

    }
    add(item:Box)
    {
        if(this.expanded)
        {
            item.show(true);
        }
        else
        {
            if(this.items.length==0)
            {
                item.preview=true;
                item.show(true);
            }
            else
                item.show(false);
        }

        this.items.push(item);
        this.elm.appendChild(item.elm);
    }
    expandChildren (expanded:boolean)
    {
        this.items.forEach(
            (box,i)=>
            {
                box.expand(expanded);
            }
        );
    }
    showChildren (expanded:boolean)
    {
        this.items.forEach(
            (box,i)=>
            {
                box.preview=((i==0)&&(!expanded));
                if(i)
                {
                    box.show(expanded)
                }
                else
                {
                    box.show(true);


                }
            }
        );
    }
    expand(expanded:boolean)
    {
        super.expand(expanded);
        this.showChildren(expanded);

    }
    onClick(ev:MouseEvent)
    {
        console.log("BoxList click",this.level,this.title);

        setTimeout(() => {
            let y = this.elmTitle.getBoundingClientRect().top + window.scrollY;
            let offset=0;
            if(this.parent)
                offset=this.parent.elmTitle.getBoundingClientRect().bottom;

            window.scrollTo({behavior:"smooth",top:y-88})
        },300);

        ev.stopPropagation();
        if(!this.parent)
        {
            this.expandChildren(false);
            return false;


        }
        this.toggle();
        return false;
    }
}
export class BoxImage extends Box
{
    elmTitle : HTMLDivElement;
    img : HTMLImageElement;
    imgUrl:string;


    constructor(parent:BoxList,title: string,url:string,thumbnail:string,shown=true) {
        super(parent,title);
        this.img=$.create("img");
        this.imgUrl=url;
        this.img.src=thumbnail;
        this.img.title=title;
        this.elm.classList.add("zs_box_image");
        this.elm.appendChild(this.img);
        this.elmTitle.className="image_label";
        this.elm.appendChild(this.elmTitle);

    }
    onClick(ev:MouseEvent)
    {
        if(this.preview)
            return false;

        console.log("BoxImage click");
        ev.stopPropagation();
        if(this.imgUrl)
        {
            this.img.src=this.imgUrl;
            this.imgUrl=null;
        }
        this.toggle();
        //if(this.expanded)
        {
            setTimeout(() => {
                //this.elm.scr
                const y = this.elm.getBoundingClientRect().top + window.scrollY;
                const offset=this.parent.elmTitle.getBoundingClientRect().bottom;
                window.scrollTo({behavior:"smooth",top:y-offset})
                //this.elm.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
                //this.img.scrollIntoView(true);
            },300);

        }


        return false;
    }

}

export class BoxText extends Box
{
    elmText : HTMLDivElement;
    imgUrl:string;

    constructor(parent:BoxList,title: string,url:string,thumbnail:string,shown=true) {
        super(parent,title);
        this.elmText=$.create("div");
        this.elm.classList.add("zs_box_text");
        this.elm.appendChild(this.elmText);

    }
    onClick(ev:MouseEvent)
    {
        if(this.preview)
            return false;

        console.log("BoxImage click");
        ev.stopPropagation();


        return false;
    }

}


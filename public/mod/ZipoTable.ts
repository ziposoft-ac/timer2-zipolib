import * as DO from "./zb/DataObj.js";
import {DataObj, DataObjMeta, DoConT, getMeta} from "./zb/DataObj.js";

export class ZipoTable
{
    htable : HTMLTableElement;
    data : DO.DataObj [];
    meta : DataObjMeta;
    constructor(id:string=null) {
        if(id)
            this.htable=<HTMLTableElement>document.getElementById(id);
        else
            this.htable=document.createElement('table');
    }
    show(flds:DO.FieldSet ,arr: object[]  )
    {


        let h='<thead><tr>';
        for (const f of flds) {
            if(f.props.showList)
            {
                h+=`<th>${f.getDisplayName()}</th>`;
            }
        }
        h+='</tr></thead>';
        for(let obj of arr)
        {
            h+="<tr>";
            for (const f of flds)  {
                if(f.props.showList)
                {
                    let val=f.getDisplayString(obj,null);
                    h+=`<td>${val}</td>`;
                }
            }
            h+="</tr>";

        }
        this.htable.innerHTML=h;
    }
    show1(meta:DataObjMeta ,arr: object[]  )
    {
        this.meta=meta;
        let flds=this.meta.fields;


        let h='<thead><tr>';
        for (const f of flds) {
            if(f.props.showList)
            {
                h+=`<th>${f.getDisplayName()}</th>`;
            }
        }
        h+='</tr></thead>';
        for(let obj of arr)
        {
            h+="<tr>";
            for (const f of flds)  {
                if(f.props.showList)
                {
                    let val=f.getDisplayString(obj,null);
                    h+=`<td>${val}</td>`;
                }
            }
            h+="</tr>";

        }
        this.htable.innerHTML=h;
    }
    showType(classRef:typeof DataObj ,arr: object[]  )
    {
        // @ts-ignore
        let ctor=classRef.prototype.constructor;
        // @ts-ignore
        this.show(getMeta(ctor));
    }
    displaydata(data: object[])
    {
        let h='';
        for(let row of data)
        {
            h+='<tr>';
            for(let d in row)
            {
                let val=row[d];
                h+=`<td>${val}</td>`;
            }
            h+='</tr>';
        }
        this.htable.innerHTML=h;

    }
}

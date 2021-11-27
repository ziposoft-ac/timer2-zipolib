

import * as Util from "/zs_client/Util.js";
import {IField,IFieldSet} from "/zs_client/zb/IField.js";
import {Factory} from "/zs_client/Util.js";


export type DoConT<T extends DataObj> = new () => T;


export type FldCon = new (iF:IField) =>  Field;

export var fldFactory=new Map<string,FldCon>();




export function FF (constructor) {
    //console.log("FEILD TYPE:",constructor.name);
    fldFactory.set(constructor.name,constructor);
    //Util.gObjFactory.addClass(constructor);

}

export interface IndexIdInt
{
    indexedType: typeof DataObj;
    id : number;

}
export abstract class Field
{
    get id() { return this.props.id; }
    props: IField={id:"?",name:"?", showList: true,summary: false };
    constructor(props:Partial<IField> ) {
        this.props=Object.assign(this.props,props);
    }
    getData(obj:DataObj) { return }
    getDisplayName() { return this.props.name; }
    getDbType() :string { return null  }
    copyFromDb (obj: object,row:object){
        if(this.id in row)
            obj[this.id]=row[this.id] }
    copyToDb(obj: object,row:object) { row[this.id]=obj[this.id] }
    abstract getDisplayString(obj: object,objEx:object) : string;
    getDisplayElm(obj: object,objEx:object)
    {
        return null;
    };
    getIndex(obj: DataObj) :IndexIdInt { return null }
    getSummary(obj: DataObj,summary:object){
        if(this.props.summary)
            summary[this.id]= obj[this.id];
    };


}
@FF export class FieldId extends Field
{
    getDbType() { return `INTEGER PRIMARY KEY`}
    getDisplayString(obj: object,objEx:object) { return  obj[this.id];}

}


export class FieldSet
{
    map =new Map<string, Field>();
    constructor(o:IFieldSet=null) {
        if(o)
        for(let i in o.set ) {
            let iF=o.set[i];
            let fldCon=fldFactory.get(iF.type);
            if(!fldCon)
            {
                console.log("Bad field type:",iF.type);
                continue;
            }
            let fld=new (fldCon)(iF);
            this.map.set(i,fld);
        }

    }
    mergeSet(other:FieldSet)
    {
        other.map.forEach((f,k)=>this.set(k,f));

    }
    set(id:string,fld:Field)
    {
        this.map.set(id,fld);
    }
    [Symbol.iterator]() { return this.map.values(); }
    getAsObject() : IFieldSet
    {
        let obj:IFieldSet={ set:{} };
        this.map.forEach((f,k)=>{
            obj.set[k]=f.props;
            //obj.set[k]["__type__"]=f.constructor.name;
            f.props.type=f.constructor.name;
        });
        return obj;
    }
    getJson() : string
    {
        return JSON.stringify(this.getAsObject());
    }
}


export type DOC = new () => typeof DataObj;


export class DataObjMeta
{
    con : DOC;
    name="?";
    constructor(con : DOC) {
        this.con=con;
        this.name=con.name;
        Util.gObjFactory.addClass(con);

        //dataFactory.addClass(con);
        //console.log("do: ",this.name);
    }
    protected fsUnique : FieldSet = new  FieldSet();
    protected fsAll : FieldSet = null;
    get fields() :  FieldSet
    {
        if(!this.fsAll)
        {
            this.fsAll= new  FieldSet();
            this.createFieldSet(this.fsAll);
        }
        return this.fsAll;
    }

    addField(name:string,fld:Field) : Field
    {
        this.fsUnique.set(name,fld);
        return fld;
    }
    createFieldSet(set: FieldSet){
        // @ts-ignore

        if(this.con!=DataObj)
        {
            // @ts-ignore
            let base=this.con.__proto__;

            let m=getMeta(base);
            if(m)
                m.createFieldSet(set);
        }
        set.mergeSet(this.fsUnique);

    }
}

export function getMeta(con: DOC) :DataObjMeta
{
    const metaKey="__meta_"+con.name;
    let m= con[metaKey];
    if(!m)
    {
        m=con[metaKey]=new DataObjMeta(con);
        m.addField('id',new FieldId({id: 'id',name:'id' }));
    }
    return m;
}
// member decorator.
export function Fld<FIELD_T extends Field> (classobj: Object,id:string,type: (new (prop) => FIELD_T),opt:Partial<IField>={})
{
    let p=Object.assign({id: id,name:id },opt);
    // @ts-ignore
    let f=getMeta(classobj.constructor).addField(id,new type(p));
}

export class  DataObj
{
    id: number; //dont specify ID, allow autokey
    getId():number
    {
        return this.id;
    }
    get fields() :  FieldSet
    {
        return this.meta.fields;
    }
    constructor() {
    }
    get meta() :DataObjMeta
    {
        // @ts-ignore
        return getMeta(this.constructor);
    }
    copyToDbRow() : Object  {
        let row= {};
        for(let f of this.meta.fields)
            f.copyToDb(this,row);

        return row;
    }
    copyFromDbRow(row : Object)   {
        for(let f of this.meta.fields)
        {
            f.copyFromDb(this,row);
        }

        return this;
    }
    merge(obj : Object=null) {
        if(obj)
        {
            for(let key in obj)
            {
                if((key in this)||(key=='id'))
                {
                    this[key]=obj[key];
                }
            }
        }
    }

    getSummary() : object
    {
        let flds=this.meta.fields;
        let summary={};
        for (let f of flds)
            f.getSummary(this,summary);
        return summary;
    }
    getSummaryString(flds:FieldSet=this.meta.fields) : string
    {
        let h="";
        for (let f of flds) {
            if(f.props.summary)
            {
                if(h) h+=" ";
                h+=f.getDisplayString(this,null);
            }


        }
        return h;
    }
    consoleDump()
    {

        for(let f of this.meta.fields)
        {
            console.log(`${f.id}: ${f.getDisplayString(this,null)}`);
        }
    }
    getHtmlTable() : string
    {
        let h='<table>';
        for (const [key, value] of Object.entries(this)) {
            h+=`<tr><td>${key}</td><td>${value}</td></tr>`;
        }
        h+='</table>';
        return h;
    }
    dumpFields()
    {
       console.log(this.meta.fields);

    }
}
export interface  IFieldIdx extends IField{
    indexedType: typeof DataObj;
}




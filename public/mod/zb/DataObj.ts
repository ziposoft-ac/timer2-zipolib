
//import * as F from "./Fields.js";



export interface  IField {
    type ? : string;
    showList ?: boolean;
    id : string;
    name : string;
}
export interface  IFieldSet {
    set : Record<string,IField>;
}
export type DoConT<T extends DataObj> = new () => T;
export type IdxFetch = (type:typeof DataObj,id: number)=>string;


export type FldCon = new (iF:IField) =>  Field;

export var fldFactory=new Map<string,FldCon>();




export function FF (constructor) {
    console.log("FEILD TYPE:",constructor.name);
    fldFactory.set(constructor.name,constructor);
}



export abstract class Field
{
    get id() { return this.props.id; }
    props: IField={id:"?",name:"?", showList: true };
    constructor(props:IField ) {
        this.props=Object.assign(this.props,props);
    }
    getDisplayName() { return this.props.name; }
    abstract getDbType();
    copyFromDb (obj: object,row:object){
        if(this.id in row)
            obj[this.id]=row[this.id] }
    copyToDb(obj: object,row:object) { row[this.id]=obj[this.id] }

    getDisplayType()
    {
        return this.getDbType();
    }
    abstract getDisplayString(obj: object,fetch:IdxFetch) : string;


}
export class FieldSet
{
    map =new Map<string, Field>();
    constructor(o:IFieldSet=null) {
        if(o)
        for(let i in o.set ) {
            let iF=o.set[i];
            let fldCon=fldFactory.get(iF.type);
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

export var dataObjReg=new Map<string,DataObjMeta>();

export class DataObjMeta
{
    con : DOC;
    name="?";
    constructor(con : DOC) {
        this.con=con;
        this.name=con.name;
        dataObjReg.set(this.name,this);
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
        let base=this.con.__proto__;
        if(base!=DataObj)
        {
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
        m=con[metaKey]=new DataObjMeta(con);
    return m;
}

export class  DataObj
{
    rowid : number=-1;
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
        row['rowid']=this.rowid;

        return row;
    }
    copyFromDbRow(row : Object)   {
        for(let f of this.meta.fields)
        {
            f.copyFromDb(this,row);
        }
        this.rowid=row['rowid'];

        return this;
    }
    directCopy(obj : Object=null) {
        if(obj)
        {
            for(let key in obj)
            {
                if(key in this)
                {
                    this[key]=obj[key];
                }
            }
        }
    }
    getSummary() : string
    {
        let flds=this.meta.fields;
        let h="";
        for (let f of flds) {
            if(h) h+=" ";
            h+=f.getDisplayString(this,null);

        }
        return h;
    }
    consoleDump()
    {
        for (const [key, value] of Object.entries(this)) {
            console.log(`${key}: ${value}`);
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

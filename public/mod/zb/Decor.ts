import * as F from "./Fields.js";
import {DataObj, getMeta,IField,Field} from "./DataObj.js";
import {FieldDummy} from "./Fields.js";
//import "reflect-metadata";

export function getDataObjFldList(classobj: Object) :Object
{
    const fieldListId="__flds_"+classobj.constructor.name;

    // Adds and/or gets the field list from the Class of the Data Object
    return  classobj.constructor[fieldListId] ?? (classobj.constructor[fieldListId]={});
}

// member decorator.
function Fld<FIELD_T extends Field> (classobj: Object,id:string,type: (new (prop) => FIELD_T),opt:Partial<IField>={})
{

    let p=Object.assign({id: id,name:id },opt);

    // @ts-ignore
    let f=getMeta(classobj.constructor).addField(id,new type(p));

}

type DecFunc= (classType,memberName)=>void;





export function Dummy(c ,p) { Fld(c,p,F.FieldDummy) }
export function Text(c ,p) { Fld(c,p,F.FieldText) }
export function Int(c,p) { Fld(c,p,F.FieldInt) }
export function KeyText(c,p) { Fld(c,p,F.FieldKeyText) }
export function KeyInt(c,p) { Fld(c,p,F.FieldKeyInt) }
export function AutoKey(c,p) { Fld(c,p,F.FieldAutoKey) }
export function Bool(c,p) { Fld(c,p,F.FieldBool) }
export function Float(c,p) { Fld(c,p,F.FieldFloat) }
export function DateTime(c,p) { Fld(c,p,F.FieldDateTime) }

export function FieldT<FIELD_T extends Field>(type: (new (prop) => FIELD_T), props:Partial<IField> ) : DecFunc
{
    return (c,p)=> Fld(c,p,type,props);
}

export function TextP( props:Partial<IField> ) : DecFunc
{
    return (c,p)=> Fld(c,p,F.FieldText,props);
}

export function IndexInt( classRef : typeof DataObj ,opt:Partial<F.IFieldIdx> ={}  ) : DecFunc
{

    return (c,id)=>
    {
        opt.indexedType=classRef;
        Fld(c,id,F.FieldIndexInt,opt);

        //getMeta(c.constructor).addField(id,new F.FieldIndexInt(p));
    }
}

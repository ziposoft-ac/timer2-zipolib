import {IField,IFieldSet} from "/zs_client/zb/IField.js";
import {DataObj, getMeta,Field,IFieldIdx,Fld} from "/zs_client/zb/DataObj.js";
import * as Util from "/zs_client/Util.js";

interface FieldCon {
    new (props:IField ): Field;
}
interface FieldConIndex {
    new (props:IFieldIdx ): Field;
}
interface FieldModule {
    FieldText : FieldCon;
    FieldInt : FieldCon;
    FieldKeyText : FieldCon;
    FieldAutoKey : FieldCon;
    FieldBool : FieldCon;
    FieldDateTime : FieldCon;
    FieldKeyInt : FieldCon;
    FieldTextFunc : FieldCon;
    FieldFloat : FieldCon;
    FieldImg : FieldCon;
    FieldIndexInt : FieldConIndex;
    FieldJson : FieldCon;

}



let F: FieldModule=await Util.importClientServer('zb/Fields.js');


type DecFunc= (classType,memberName)=>void;





export function Text(c ,p) { Fld(c,p,F.FieldText) }
export function Int(c,p) { Fld(c,p,F.FieldInt) }
export function KeyText(c,p) { Fld(c,p,F.FieldKeyText) }
export function KeyInt(c,p) { Fld(c,p,F.FieldKeyInt) }
export function AutoKey(c,p) { Fld(c,p,F.FieldAutoKey) }
export function Bool(c,p) { Fld(c,p,F.FieldBool) }
export function DateTime(c,p) { Fld(c,p,F.FieldDateTime) }

export function FieldT<FIELD_T extends Field>(type: (new (prop) => FIELD_T), props:Partial<IField> ) : DecFunc
{
    return (c,p)=> Fld(c,p,type,props);
}
export function Float( props:Partial<IField> ) : DecFunc
{
    return (c,p)=> Fld(c,p,F.FieldFloat,props);
}
export function Image( props:Partial<IField> ) : DecFunc
{
    return (c,p)=> Fld(c,p,F.FieldImg,props);
}
export function TextP( props:Partial<IField> ) : DecFunc
{
    return (c,p)=> Fld(c,p,F.FieldText,props);
}
export function FJson( props:Partial<IField> ) : DecFunc
{
    return (c,p)=> Fld(c,p,F.FieldJson,props);
}
export function ElmFunc( props:Partial<IField> ) : DecFunc
{
    return (c,p)=> Fld(c,p,F.FieldTextFunc,props);
}

export function IndexInt( classRef : typeof DataObj ,opt:Partial<IFieldIdx> ={}  ) : DecFunc
{

    return (c,id)=>
    {
        opt.indexedType=classRef;
        Fld(c,id,F.FieldIndexInt,opt);

        //getMeta(c.constructor).addField(id,new F.FieldIndexInt(p));
    }
}

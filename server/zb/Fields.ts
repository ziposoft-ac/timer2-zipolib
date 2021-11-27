import {IField,IFieldSet} from "/zs_client/zb/IField.js";

import {DataObj, Field,  IFieldIdx, FF, IndexIdInt} from "/zs_client/zb/DataObj.js";
import * as Time from "/zs_client/Time.js"
import * as $ from "/zs_client/Dom";







@FF export  class FieldJson extends Field
{
    constructor(props:IField ) {    super(props);   }
    getDbType() { return "TEXT"}
    copyFromDb(obj: object,row:object)
    {
        let objVal=null;
        try {
            let json=row[this.id];
            if(json)
                objVal=JSON.parse(json);
        }
        catch (e)
        {
            objVal={error: "json parse error"};

        }
        obj[this.id]=objVal;
    }
    copyToDb(obj: object,row:object)
    {
        row[this.id]=JSON.stringify(obj[this.id]);
    }
    getDisplayString(obj: object) : string
    {
        let val= obj[this.id];
        if(val)
            return "";
        else
            return "JSON";
    }
}
@FF  export class FieldTextFunc extends Field
{
    constructor(props:IField )
    {
        super(props);
    }
    getDbType()
    {
        return null;
    }

    getDisplayString(obj: object) : string
    {
        let funcname=this.id;
        return obj[this.id]();
    }
}
@FF  export class FieldText extends Field
{
    constructor(props:IField ) {    super(props);   }
    getDbType() { return "TEXT"}

    getDisplayString(obj: object) : string
    {
        return obj[this.id];
    }
}
@FF export class FieldImg extends FieldText
{
}


@FF export class FieldFloat extends Field
{
    getDbType() { return `REAL`}
    //setDefault(obj) {   obj[this.name]=0;  }
    getDisplayString(obj: object,objEx:object) : string
    {
        let f : number =<number> obj[this.id];
        return  f.toFixed(2);
    }
}

@FF export class FieldInt extends Field
{
    getDbType() { return `INTEGER`}
    getDisplayString(obj: object,objEx:object) : string
    {
        return  obj[this.id];
    }
}

@FF  export class FieldIpAddress extends FieldInt
{
    getDisplayString(obj: object,objEx:object) : string
    {
        let n  =<number> obj[this.id];
        let str=(n&0xff000000)+"."+(n&0xff0000)+"."+(n&0xff00)+"."+(n&0xff);
        return str;


    }
}


@FF export class FieldBool extends FieldInt
{
    getDisplayString(obj: object,objEx:object) : string
    {
        return  (obj[this.id]>0?"TRUE":"FALSE");
    }
}
@FF export class FieldDateTime extends FieldInt
{
    getDisplayType() { return `DATETIME`}
    getDisplayString(obj: object,objEx:object) : string
    {
        return  Time.getReadableDateTimeFromMs(obj[this.id]);
    }
}


@FF export class FieldIndexInt extends FieldInt
{
    indexedType: typeof DataObj;
    // refTable : string;
    getDisplayType() { return `INDEX`}
    getIndex(obj: DataObj) :IndexIdInt
    {
        return {
            indexedType: this.indexedType,
            id: obj[this.id]
        }
    }


    getDisplayString(obj: object,objEx:object) : string
    {
        let key=obj[this.id];
        //if(fetch)             return fetch(this.indexedType,key);
        return  key;
    }
    getDbType() {
        return `INTEGER REFERENCES '${this.indexedType.name}'('id') ON DELETE CASCADE`
    }
    constructor( props : IFieldIdx) {
        super(props);
        this.indexedType=props.indexedType;

    }
}
@FF export class FieldAutoKey extends FieldInt
{
    getDbType() { return `INTEGER  KEY AUTOINCREMENT`}
    getDisplayString(obj: object,objEx:object) { return "";}

}
@FF export class FieldKeyInt extends FieldInt
{
    getDbType() { return `INTEGER  KEY`}
    getDisplayString(obj: object,objEx:object) { return "";}

}
@FF export class FieldKeyText extends FieldText
{
    getDbType() { return `TEXT  KEY`}

}



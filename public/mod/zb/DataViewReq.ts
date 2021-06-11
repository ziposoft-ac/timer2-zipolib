import * as ajax from "../Ajax.js"
import * as DO from "./DataObj.js"
import * as F from "./Fields.js"

export class ReqGetDbTypes extends ajax.Req(
    class{}, class
    {
        types:string[]=[];
    }
)
{

}

export class ReqDataParams
{
    dbType="zat";
    dbName="stravacache.db";
    tblName: string=null;
}


export class ReqGetDb extends ajax.Req(
    ReqDataParams,
    class
    {
        files:string[]=[];

        tables:string[]=[];
    }
)
{

}

export class ReqGetRecords extends ajax.Req(
    ReqDataParams,
    class
    {
        objType:string="unknown";
        arr:object[]=[];

        fields: DO.IFieldSet={ set: {}};
    }
)
{

}

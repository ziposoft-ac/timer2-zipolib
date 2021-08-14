/*
 * Copyright (c) 2018.  ZipoSoft, Inc - All Rights Reserved
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Anthony Corriveau <ac@ZipoSoft.com>  2018
 */


import fs from "fs";

export async function jsonWrite(filename:string,obj:object,pretty=false) : Promise<boolean>
{
    try {
        await fs.promises.writeFile(filename, JSON.stringify(obj,null,(pretty?2:0)));
    }
    catch (e) {
        console.log("jsonWrite FAILED:",filename,e);
        return false;
    }
    return true;
}
export async function jsonRead<T>(filename:string) : Promise<T>
{
    let obj:T=null;
    try {
        let buff=await fs.promises.readFile(filename);
        if(buff)
            obj=JSON.parse(buff.toString());
    }
    catch (e) {
        console.log("jsonRead FAILED:",filename,e);
        return null;
    }
    return obj;
}

export function objClone(src:Object) : Object
{
    let clone=(src:Object,depth) : Object=>{
        if(++depth > 10)
            throw Error("Object clone recursion exceeds 10.")
        let  dest=Object.assign({},src);
        // @ts-ignore
        dest.__proto__=src.__proto__;
        for (const [key, value] of Object.entries(dest)) {
            if(typeof value === "object")
                dest[key]=clone(value,depth);
        }
        return dest;
    }
    return clone(src,0);
}
export class Factory
{
    classes : Record<string,any>={};
    save(obj:object,pretty=false) : string
    {
        let clone=(src:Object,depth) : Object=>
        {

            if(++depth > 10)
                throw Error("Object assign recursion exceeds 10.");
            if(!src) return;
            let  dest=Object.assign({},src);
            for (const [key, value] of Object.entries(dest)) {
                if(typeof value === "object")
                    dest[key]=clone(value,depth);
            }

            dest["__type__"]=src.constructor.name;
            return dest;
        }
        let copy=clone(obj,0);
        return JSON.stringify(copy,null,(pretty?2:0));
    }

    load(json:string) : object
    {
        let temp=JSON.parse(json);

        let createObj=(objIn:Object) : Object=>{

            let type=objIn["__type__"];
            let objOut=null;
            if(type)
            {
                delete(objIn["__type__"]);
                objOut=this.newObj(type);
            }
            else objOut={};
            for (const [k, value] of Object.entries(objIn)) {
                let v=value;
                if(typeof value === "object")
                {
                    v=createObj(value);
                }
                objOut[k]=v;
            }
            return objOut;

        }
        return createObj(temp);
    }
    saveInPlace(obj:object,pretty=false) : string
    {
        let assignType=(obj:Object,depth) : void=>
        {
            if(!obj) return;

            if(++depth > 10)
                throw Error("Object assign recursion exceeds 10.");
            for (const [, value] of Object.entries(obj))
            {
                if(typeof value === "object")
                    assignType(value,depth);
            }
            obj["__type__"]=obj.constructor.name;
        }
        assignType(obj,0);
        return JSON.stringify(obj,null,(pretty?2:0));
    }
    constructor(
        classes : any[]=[]
    )
    {
        for(let c of classes)
        {
            this.classes[c.name]=c;
        }
    }
    newObj(type:string) : Object
    {
        let c=this.classes[type];
        return (c?new c(): new Object());
    }
}

export function stringToBase64(str: string): string {
    const buff = Buffer.from(str, 'utf8');
    return buff.toString('base64');
}
export function base64ToString(base64str: string): string {
    const buff = Buffer.from(base64str, 'base64');
    return buff.toString('utf8');
}

export function km_to_miles(km)
{
    return (km*0.621371);
}
export function miles_to_km(miles)
{
    return (miles/0.621371);
}
export function celciusToF(c:number)
{
    return Math.round(c*90/5+320)/10;

}

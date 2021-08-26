/*
 * Copyright (c) 2018.  ZipoSoft, Inc - All Rights Reserved
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Anthony Corriveau <ac@ZipoSoft.com>  2018
 */

export async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function mergeObj(src:Object,dest:Object) {
    if(src)
        for(let key in src)
            if(key in dest)
                dest[key]=src[key];
}

export class Serialze
{
    waiting = [];
    taken = false;

    async acquire() {
        return new Promise(resolve =>
        {
            if (!this.taken) {
                this.taken = true;
                resolve(null);
                return;
            }
            this.waiting.push(resolve);
        });
    }
    release() {
        if (!this.taken) return;
        if (this.waiting.length > 0) {
            const resolve = this.waiting.shift();
            resolve();
        } else {
            this.taken = false;
        }
    }
};

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
            let  dest= {};
            for (const [key, value] of Object.entries(src)) {
                let copyVal=(val)=>{
                    if(val instanceof Array)
                    {
                        let v=[];
                        for(let i=0;i<val.length;i++)
                            v.push(copyVal(val[i]));
                        return v;
                    }
                    if(typeof val === "object")
                    {
                        return clone(val,depth);
                    }
                    return val;
                }

                dest[key]=copyVal(value);
            }
            if(src.constructor.name in this.classes)
            {
                dest["__type__"]=src.constructor.name;
            }
            return dest;
        }
        let copy=clone(obj,0);
        return JSON.stringify(copy,null,(pretty?2:0));
    }
    reBuild(plain:object)
    {

        let createObj=(objIn:Object) : Object=>{
            if(!objIn) return objIn;
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
        return createObj(plain);
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

                let copyVal=(val)=>{
                    if(val==null) return null;
                    if(val instanceof Array)
                    {
                        let v=[];
                        for(let i=0;i<val.length;i++)
                            v.push(copyVal(val[i]));
                        return v;
                    }
                    if(typeof val === "object")
                    {
                        return createObj(val);
                    }
                    return val;
                }
                objOut[k]=copyVal(value);
            }
            return objOut;

        }
        return createObj(temp);
    }
    setTypes(obj:object) : void
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
            if(obj.constructor.name in this.classes)
            {
                obj["__type__"]=obj.constructor.name;
            }
        }
        assignType(obj,0);
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
            if(obj.constructor.name in this.classes)
            {
                obj["__type__"]=obj.constructor.name;
            }
        }
        assignType(obj,0);
        return JSON.stringify(obj,null,(pretty?2:0));
    }
    addClass(c)
    {
        this.classes[c.name]=c;
        console.log("Factory:",c.name);

    }
    constructor(
        classes : any[]=[]
    )
    {
        for(let c of classes)
        {
            this.addClass(c);
        }
    }
    newObj(type:string) : Object
    {
        let c=this.classes[type];
        return (c?new c(): new Object());
    }
}
export var gObjFactory=new Factory();

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

/*
 * Copyright (c) 2018.  ZipoSoft, Inc - All Rights Reserved
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Anthony Corriveau <ac@ZipoSoft.com>  2018
 */

import fs from 'fs';
import CsvParse from "csv-parse";
export async function mergeObj(src:Object,dest:Object) {
    if(src)
        for(let key in src)
            if(key in dest)
                dest[key]=src[key];
}
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
export async function loadCsvFile(fullpath:string,rowCallback: (data:string[])=>void) : Promise<boolean>
{
    let run=(resolveFunc: (boolean)=>void,reject)=>
    {
        fs.createReadStream(fullpath)
            .pipe(CsvParse({delimiter: ','}))
            .on('data', (csvrow)=> {
                rowCallback(csvrow);
            })
            .on('end',()=> {
                resolveFunc(true);
            }).on('error',(err => {
                console.log(err.message);
                resolveFunc(false);
        }));
    };
    return  new Promise(run);
}
export async function loadCsvFileAll(fullpath:string) : Promise<string[][]>
{
    let data:string[][]=[];
    await loadCsvFile(fullpath,(row)=>{data.push(row)});
    return data;
}

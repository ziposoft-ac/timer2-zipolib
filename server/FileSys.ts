import * as fs from "fs";
import * as  pathlib from "path";


export async function getFileStat(filename) :Promise< { stats: fs.Stats, error: Object}>
{
    let stats=null;
    let error=null;
    stats= await fs.promises.stat(filename).catch(
        (err)=>{
            if(err['code']&&(err.code=='ENOENT'))
            {

            }
            else
            {
                error=err;
            }
        }
    );
    return {stats,error};
}

interface treeOptions
{
    rootpath: string,
    match : string,
    callback: (fullpath:string,relpath:string,name:string)=>boolean
}

export function traverseTree(relpath: string,opt: treeOptions ) : void
{
    let ls: fs.Dirent[]= fs.readdirSync(opt.rootpath+"/"+relpath,{withFileTypes:true}) ;
    for(let de of ls )
    {
        if(de.isDirectory())
        {
            let subpath= relpath+de.name+"/";
            traverseTree(subpath,opt);
            continue;
        }
        if(de.name.includes(opt.match))
        {
            let fullpath=pathlib.join(opt.rootpath,relpath,de.name);
            opt.callback(fullpath,relpath,de.name);
        }
    }
}

export function treeDel(rootpath: string, match : string)
{
    let opt:treeOptions=
        {
            rootpath:rootpath,
            match:match,
            callback:
                (fullpath:string,relpath:string,name:string)=>
                {
                    console.log(fullpath);
                    fs.rmSync(fullpath);
                    return true;
                }
        };
    traverseTree("",opt);
}



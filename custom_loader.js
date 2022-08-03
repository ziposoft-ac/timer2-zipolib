// custom-loader.mjs
import 'source-map-support/register.js';
//node --experimental-json-modules --loader ./custom_loader.js ./test/basics/modpath.js
let x=process.env;
var proj_root=process.cwd();
var zipo_root=x.ZIPO_ROOT;
if(x.PROJ_ROOT)
    proj_root=x.PROJ_ROOT;
global["proj_root"]=proj_root;
global["zipo_root"]=zipo_root;
console.log("------------",proj_root,"---------");
import path from 'path';
import fs from "fs";
//import npmPackage from './package.json';



let npmPackage={};
let buff=await fs.promises.readFile(proj_root+"/package.json").catch((e)=>{
    console.log("Cannot get package.json:",e);
    exit(1)
});
if(buff)
{
    try {
        npmPackage=JSON.parse(buff.toString());
    }
    catch (e)
    {
        console.log("Cannot parse package.json:",e);
        exit(1)
    }
}


const getAliases = () => {

    const base = proj_root;//process.cwd();

    const aliases = npmPackage.aliases || {};

    const absoluteAliases = Object.keys(aliases).reduce((acc, key) =>
            aliases[key][0] === '/'
                ? acc
                : { ...acc, [key]: path.join(base, aliases[key]) },
        aliases)

    return absoluteAliases;

}

const isAliasInSpecifier = (path, alias) => {
    return path.indexOf(alias) === 0
        && (path.length === alias.length || path[alias.length] === '/')
}

const aliases = getAliases();
console.log("aliases:",aliases);

export const resolve = (specifier, parentModuleURL, defaultResolve) => {

    const alias = Object.keys(aliases).find((key) => isAliasInSpecifier(specifier, key));
    let newSpecifier = alias === undefined
        ? specifier
        : path.join(aliases[alias], specifier.substring(alias.length));


    /*

    console.log("specifier:",specifier);
    console.log("parentModuleURL:",parentModuleURL);
    console.log("newSpecifier:",newSpecifier);
    console.log("defaultResolve:",defaultResolve);

*/
    if(!(newSpecifier.endsWith(".cjs")||newSpecifier.endsWith(".js")||newSpecifier.endsWith(".json")))
    {
        if(newSpecifier.startsWith("/")
            ||newSpecifier.startsWith(".")
           // ||newSpecifier.startsWith("@")
        )
        {
            newSpecifier+=".js";


        }
    }
    let prom= defaultResolve(newSpecifier, parentModuleURL);
    prom.then(()=>{
            //console.log("success:",newSpecifier);

        },
        ()=>{
            console.log("failed:",newSpecifier);

        }
        )
    return prom;
}

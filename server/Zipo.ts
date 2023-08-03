import pathlib from "path";



let x=process.env;
var proj_root=process.cwd();
var zipo_root=x.ZIPO_ROOT;
if(x.PROJ_ROOT)
    proj_root=x.PROJ_ROOT;
global["proj_root"]=proj_root;
global["zipo_root"]=zipo_root;

function func(...pathSegments: string[]): string
{
    return "x";
}


export class ZiposoftServerLib
{
    datapath : string;
    root ="";
    constructor() {
        this.root=global["proj_root"] ?? "/home/ac/www/zipo.ts/";
        this.datapath=this.root+"/data/";
    }
    delay(t) {
        return new Promise(resolve => setTimeout(resolve, t));
    }
    getArgs(options: Object)
    {
        for(let i=2;i<process.argv.length;i++)
        {
            let pair=process.argv[i].split("=");
            if(pair.length==2)
            {
                let name=pair[0];
                let val=pair[1];
                if(options.hasOwnProperty(name))
                {
                    let t=typeof options[name];
                    switch(t)
                    {
                        case "number":
                            options[name]=Number(val);
                            break;
                        case "boolean":
                            options[name]= (val == 'true');
                            break;
                        default:
                            options[name]=val;
                    }
                } else {
                    console.log(`No option named:'${name}'`);
                }
            } else   {
                console.log("Bad argument:",process.argv[i]);
            }
        }
    }


    log()
    {

    }
    // TODO!! - fix this so that it is ALWAYS relative path even if an arg starts with /
    path(...pathSegments: string[]): string
    {
        pathSegments.unshift(this.root);
        //let path= pathlib.resolve(pathSegments);

        let p= pathlib.resolve.apply(pathlib,pathSegments);
        //let p=func.apply(null,["f"]);
        return p;

    }

    getStart()
    {
        return process.hrtime();
    }
    getElapMs(hrstart)
    {
        let elap=process.hrtime(hrstart);
        const timeInMs =elap[0]* 1000+  elap[1] / 1000000;
        return timeInMs;
    }
    printElapMs(hrstart)
    {
        console.log(this.getElapMs(hrstart).toFixed(2));
    }

}
var gZipo = new ZiposoftServerLib();
export default gZipo;

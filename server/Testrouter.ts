import {gEnv} from '@zs_server/Env';
import * as P from '@zs_server/Page';
import {PageMenu} from '@zs_server/PageMenu';
import * as Menu from "@zs_server/Menu";
import * as IM from "/zs_client/IMenu";
import * as express from 'express';
//import Url from 'url-parse'
import * as fs from 'fs'
import {Dirent} from 'fs'
import pathlib from "path";
import {Request, Response} from "express";
import {processSR, registerSR} from "@zs_server/RequestHandler";
import {makeSR} from "@zs_server/ServerRequest";
import Zipo from "@zs_server/Zipo";

export class TestViewerPage extends PageMenu
{

    constructor(props:P.PageProps) {
        super(props);


        this.title=props.req.path;;

    }
    header(): string
    {
        let h=super.header();
        return h;//+`<h1>${this.title}</h1>`;
    }
    footer() : string
    {
        return "";

    }
    tree_server: string="";
    tree_client: string="";
    async buildmenu() {
        let path_server_tests=gEnv.path("server/testpages");
        let path_client_pages=gEnv.path("public/pages");

        let pagedir: IM.IMenu= Menu.Menu( "pagedir","PAGE DIR",IM.AccessLevel.Debug  ,[]);
        let testdir= Menu.Menu( "testdir","TEST DIR",IM.AccessLevel.Debug,[]);
        let settings= Menu.Menu( "settings","Settings",IM.AccessLevel.Debug,[
            Menu.BoolCookie("Debug","debug"),
        ]);

        this.menubar.items.push(testdir,pagedir,settings);
        this.tree_server=await this.appendDirList(testdir,
            this.tree_server,path_server_tests,"/test/page") ;
        this.tree_client=await this.appendDirList(pagedir,
            this.tree_client,path_client_pages,"/test/mod") ;
    }
    async build() {
        await this.buildmenu();
        await super.build();
    }
    main() {
        let h=``;
        /*
        for(let i=9500;i<9800;i++)
        {
            h+=`<div>${i} = &#${i}</div>`;
        }*/
        h+=this.tree_server;
        return h;

    }
    async appendDirList(menu:IM.IMenu,h : string,path_local : string,path_web:string)
    {
        let ls: Dirent[]=await fs.promises.readdir(path_local,{withFileTypes:true}) ;
        for(let de of ls )
        {

            if(de.isDirectory())
            {

                let url=path_web+'/'+de.name;
                h+=`<div>${de.name}</div><ul>`;
                let submenu=Menu.Menu(de.name,de.name,IM.AccessLevel.Debug,[]);

                h=await this.appendDirList(submenu,h,pathlib.join(path_local,de.name),url);
                h+='</ul>';
                menu.items.push(submenu);
                continue;
            }
            let parts=de.name.split(".");
            let url=null;
            let name=parts[0];
            if((parts.length==2)&&(parts[1]=="ts"))

            {
                url=path_web+'/'+parts[0];
            }
            /*
            if((parts.length==2)&&(parts[1]=="html"))
            {
                url=path_web+'/'+de.name;
                name=de.name;
            }*/
            if(url)
            {
                h+=`<li><a href="${url}">${name}</a></li>`;
                let ml= Menu.Link(name,url);
                menu.items.push( ml);

            }


        }
        return h;

    }
}
class TestViewerErrorPage extends TestViewerPage
{
    exp : any =null;
    constructor(props:P.PageProps,exception) {
        super(props);

        this.exp=exception;
    }
    main(): string
    {
        let txt="Unkonw Error";
        if("stack" in this.exp)
        {
            txt=this.exp.stack;
        }


        return `<h1>TestViewerErrorPage:</h1><pre>${txt}</pre>`;
    }

}
// Init shared
export const TestRoute = express.Router();


TestRoute.get('*',
    async (req: express.Request, res: express.Response, next) => {

    let exception : any=null;
    let pageObj : P.PageServer =null;
    let pageHtml: string=null;
    try {
        //let urlParts=new Url(req.url);

        let parts=req.params[0].split('/');
        let partnum=parts.length;
        if(!parts[partnum-1])
            partnum--;
        if(partnum<2)
        {
            pageObj=new TestViewerPage({req});
        }
        else
        {
            let pagename =parts[partnum-1];
            if(!pagename)
            {
                partnum--;
                pagename =parts[partnum-1];
            }
            let base=parts[1];
            let path=parts.slice(2,partnum-1).join('/');
            if(path)
                path+="/";
            console.log("path:",path);
            console.log("pagename:",pagename);
            console.log("base:",base);
            pagename=pagename.split("?")[0];
            if(pagename)
            {
                //TODO support static files?
                if(pagename.includes("."))
                    return next();
            }

            if(base=="page")
            {
                let fullpath=Zipo.path('server/testpages',path,pagename)+".js";

                //let modpath=`./testpages/${path}${pagename}.js`;
                await import(fullpath).then((mod)=>{
                    let x=mod.default;
                    console.log("Server Page Classname ",x);
                    pageObj=new x({req});
                }).catch((e)=>{
                    console.log("No test module",e.message);
                });
            }
            else
            {
                pageObj=new TestViewerPage({req});
                let fullpath=Zipo.path('public/pages',path,pagename)
                pageObj.page_module=fullpath;

            }
        }


        try {
            await pageObj.build();
        }
        catch (e) {
            console.log("exception building:",e);
            pageObj=new TestViewerErrorPage({req},e);
            await pageObj.build();

        }
        pageObj.sendResponse(res);


    }
    catch (e) {
        pageObj=new P.PageException({req},e);
        pageObj.sendResponse(res);

    }

});



TestRoute.post("*", async (req: Request, res: Response) => {

    processSR(req,res);
});


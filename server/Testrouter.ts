import {gEnv} from './Env';
import * as P from './Page';
import {PageMenu} from './PageMenu';
import * as Menu from "./Menu";
import * as IM from "/zs_client/IMenu";
import * as Fastify from "fastify";
//import Url from 'url-parse'
import * as fs from 'fs'
import {Dirent} from 'fs'
import pathlib from "path";
import {processSR, registerSR} from "@zs_server/RequestHandler";
import Zipo from "./Zipo";
import * as FU from "./FileUtil"
import {Router} from "@zs_server/Router";

export class TestViewerPage extends PageMenu
{

    constructor(props:P.PageProps) {
        super(props);


        this.title=props.req.url;;

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
        let path_client_pages=gEnv.path("public/pages");

        let pagedir: IM.IMenu= Menu.Menu( "pagedir","PAGE DIR",IM.AccessLevel.Debug  ,[]);
        let settings= Menu.Menu( "settings","Settings",IM.AccessLevel.Debug,[
            Menu.BoolCookie("Debug","debug"),
        ]);

        this.menubar.items.push(pagedir,settings);
        this.tree_client=await this.appendDirList(pagedir,
            this.tree_client,path_client_pages,"/test/") ;
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



async function routes(fastify, options){
    fastify.get('/', async function(request, reply) {
        return {hello: 'world'}
    }),

        fastify.get('/bye', async function(request, reply) {
            return {bye: 'good bye'}
        })
}
let serverPageDir=Zipo.path('server/pages');
let clientPageDir=Zipo.path('public/pages');

export class TestRoute extends Router
{

    route(fastify : Fastify.FastifyInstance)
    {
        fastify.get('*',this.handler)
        fastify.post("*", async (req: Fastify.FastifyRequest, res: Fastify.FastifyReply) => {

            processSR(req,res);
        });
        
    }
    constructor() {
        super();


    }
    async handler(req: Fastify.FastifyRequest, res: Fastify.FastifyReply)
    {

        let exception : any=null;
        let pageObj : P.PageServer =null;
        let pageHtml: string=null;
        let moduele_path=req.params[0];
        let serverPage=serverPageDir+moduele_path+".js";
        if(await FU.fileExists(serverPage))
        {
            await import(serverPage).then((mod)=>{
                let x=mod.default;
                console.log("Server Page Classname ",x);

                pageObj=new x({req});
                pageObj.page_module="/pages/"+moduele_path;

            }).catch((e)=>{
                console.log("No server module",e.message);
            });
        }

        if(!pageObj)
        {

            try {
                pageObj=new TestViewerPage({req});
                if(await FU.fileExists(clientPageDir+moduele_path+".js"))
                {
                    pageObj.page_module="/pages/"+moduele_path;
                }
                else// PAGE NOT FOUND
                {

                }
            }
            catch (e) {
                console.log("error new TestViewerPage:",e);
                pageObj=new TestViewerErrorPage({req},e);
            }

        }
        try {
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
    }




}




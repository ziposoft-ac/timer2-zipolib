import {AjaxParams, AjaxParamsT, AjaxRequest, AjaxResponse, AjaxResponseT, ReqT} from "/zs_client/Ajax";
import {Logger} from "/zs_client/Logger";


export class ServerRequest
{
    requestId: string="none";
    in:AjaxParams;
    out:AjaxResponse;
    logger=new Logger();

    log(...args: any[]) {
        this.logger.log(...args);
    };
    trace()
    {
        this.logger.traceLine(1);
    }
    setError(...args) : boolean
    {
        this.logger.log(...args);
        this.logger.traceLine(1);
        this.out.error_msg=args.join();
        this.out.success=false;
        return false;

    }
    readInput(input)
    {
        Object.assign(this.in,input);

    }
    async preExec() : Promise<boolean>
    {
        console.log("DEFAULT preExec");
        return true;
    }
    async exec(): Promise<boolean>
    {
        console.log("DEFAULT EXEC");
        return true;

    }
    async postExec(): Promise<boolean>
    {
        console.log("DEFAULT postExec");
        return true;

    }
    preSend()
    {
        this.out.log=this.logger.lines;
    }
    postSend()
    {
        console.log("DEFAULT postSend");
    }
}

export class ServerRequestT<P,D> extends ServerRequest
{
    get params() : P { return this.in.params }
    get data() : D { return this.out.data }
    in:AjaxParamsT<P>;
    out:AjaxResponseT<D>;
    //reqT :  ReqT<P,D>;
    req: AjaxRequest<P,D>;
    constructor(ajaxReqT: ReqT<P,D> ) {
        super( );
        this.requestId=ajaxReqT.name;
        //this.in=ajaxReqT["pT"]();
        //this.out=ajaxReqT["dT"]();
        let req=new ajaxReqT();
        this.in=req.in;
        this.out=req.out;
        this.req=req;
        //this.reqT=ajaxReqT;
    }
}

var SR_Registry : Record<string, typeof ServerRequest>={};



export function  makeSR<P,D>(ajaxReqT:ReqT<P,D>  )
{
    let cl= class extends ServerRequestT<P,D>{
        constructor() {
            super(ajaxReqT);
        }
    }
    cl["requestId"]=ajaxReqT.name;
    return cl;
}


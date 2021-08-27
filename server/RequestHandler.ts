import {Req} from "/zs_client/Ajax";
import * as EX from "express";
import {makeSR, ServerRequest} from "@zs_server/ServerRequest";
import {gObjFactory} from "/zs_client/Util";

var SR_Registry: Record<string, typeof ServerRequest> = {};


export function registerSR(...SrClasses: typeof ServerRequest[]) {
    for (let SrClass of SrClasses) {
        let regType = SrClass["requestId"];
        SR_Registry[regType] = SrClass;
    }
}

let ReqError = Req(class {
}, class {
})
{

}

export class ServerRequestError extends makeSR(ReqError) {
    constructor(msg) {
        super();
        this.out.success = false;
        this.out.error_msg = msg;
    }
}

export function getSR(id: string): typeof ServerRequest {

    return SR_Registry[id];

}


export async function processSR(req: EX.Request, res: EX.Response) {

    let reqId = req.body["requestId"];
    let sr: ServerRequest;
    let srFact = getSR(reqId);
    let tsStart=process.hrtime();
    if (srFact) {

        sr = new srFact();
        let log = sr.logger;
        //log.log("got SR:", reqId);

        //Get the SR
        let input = sr.in;
        let out = sr.out;
        let success = false;
        try {
            sr.readInput(req.body);
            success = await sr.preExec();
            if (success) {
                let act = input.action;
                let func = "exec";
                if (act) {
                    if (sr[act])
                        func = act;
                    else {
                        log.log("Unknown act:", act);
                        func = null;
                        sr.out.error_msg = "Unknown action:" + act;
                    }
                }
                if (func)
                    success = await sr[func]();
                else {
                    success = false;

                }
                if (success)
                    sr.out.error_msg = "success";
                await sr.postExec(success);
            }
        } catch (e) {
            success = false;
            log.log(e);
            out.error_msg = 'Exception caught';
            if ("stack" in e) {
                out.stack = e.stack;
            }
            if ("message" in e) {
                out.error_msg = e.message;
            }
            log.log("caught exception in ajax req:", out.error_msg);
        }
        out.success = success;
    } else
        sr = new ServerRequestError("Unknown Request:" + reqId);

    sr.preSend();
    let tsDone=process.hrtime(tsStart);
    sr.out.time_total_request=tsDone[0]*1000+tsDone[1]/1000000;
    const factsend = true;
    if (factsend) {
        /*
            TODO - set types on objects, recreate objs on other side.
        */
        let json = gObjFactory.saveInPlace(sr.out, true);
        res.send(json);
    } else
        res.json(sr.out);
    try {
        sr.postSend();
    } catch (e) {
        sr.logger.log(e)
    }

}



export enum LogLevel{
    error,
    warn,
    info,
    verb,
    debug

}

export abstract class Logger
{
    timestampShow=false;
    getMs():string
    {
        let t=process.hrtime(this.timestampOffset);
        let ms= t[0]*1000+t[1]/1000000;
        return ms.toString();
    }
    setTimestamp(set:boolean)
    {
        this.timestampShow=set;
        this.timestampOffset=process.hrtime();
    }
    timestampOffset=process.hrtime();
    log(...args: any[]) {

        let str="";
        if(this.timestampShow)
            str+=this.getMs()+":";
        str+=args.join();
        this.logString(str);
        if(this.echo_console)
            console.log(str);

    };
    // default implimentation, override this
    abstract logString(line:string);

    error(...args: any[]) { this.log(args); }
    warn(...args: any[]) { if(this.level>=LogLevel.warn) this.log(...args); }
    info(...args: any[]) { if(this.level>=LogLevel.info) this.log(...args); }
    verb(...args: any[]) { if(this.level>=LogLevel.verb) this.log(...args); }
    debug(...args: any[]) { if(this.level>=LogLevel.debug) this.log(...args); }

    log_obj(obj:object)
    {
        try {
            this.logString(JSON.stringify(obj,null,2));

        }
        catch (e)
        {

        }
    }

    agent="unknown";
    constructor(public echo_console=false) {
        if(globalThis.process)
        {
            this.agent="Node";
        }
        else
        {
            let ua=globalThis.navigator.userAgent;
            if(ua)
            {
                if(ua.includes("Firefox"))
                {
                    this.agent="Firefox";
                }
                if(ua.includes("Chrome"))
                {
                    this.agent="Chrome";
                }
            }
        }
    }

    level:LogLevel=LogLevel.info;
    stack()
    {
        let e=new Error();
        let s=e.stack;
        this.log(s);
    }
    except(e)
    {
    }
    traceLine(depth=0)
    {
        let e=new Error();
        let s=e.stack;

        let lines=s.split('\n');
        this.log(lines[3+depth]);
        /*
        console.log(line);
        let func=null;
        const regex = /at (\S+) \(([^\)]+)/;
        let m = regex.exec(line);
        if(m && m.length>2)
        {
            func=m[1];
            line=m[2];
        }

         */
    }



}
export class LoggerArray extends Logger
{
    lines : string[]=[];
    getAllAsString() : string
    {
        return this.lines.join();
    }
    override logString(line:string)
    {
        this.lines.push(line);

    }
}
export class LoggerConsole extends Logger
{
    override logString(line:string)
    {
        console.log(line);

    }
}


export var gLog =new LoggerConsole();

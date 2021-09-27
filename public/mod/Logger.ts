


enum LogLevel{
    error,
    warn,
    info,
    verb,
    debug

}

export class Logger
{
    lines : string[]=[];
    log(...args: any[]) {
        let str=args.join();
        this.lines.push(str);
        this.logString(str);
        if(this.echo_console)
            console.log(...args);
    };

    logString(line:string)
    {

    }
    error(...args: any[]) { this.log(args); }
    warn(...args: any[]) { if(this.level>=LogLevel.warn) this.log(...args); }
    info(...args: any[]) { if(this.level>=LogLevel.info) this.log(...args); }
    verb(...args: any[]) { if(this.level>=LogLevel.verb) this.log(...args); }
    debug(...args: any[]) { if(this.level>=LogLevel.debug) this.log(...args); }


    getAllAsString() : string
    {
        return this.lines.join();
    }
    agent="unknown";
    constructor() {
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
    echo_console=true;
    level=2;
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

        let line=s.split('\n')[2+depth];
        this.log(line);
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




export var gLog =new Logger();

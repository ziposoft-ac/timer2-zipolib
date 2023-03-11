
export interface FetchResult<T> {
    data: T | string;
    response: Response;
    success: boolean;
    error_msg: string;
    stack: string;
}
enum format{
    json,
    text,
    binary
}
export interface FetchOptions {
    method?: string;
    bigInt?: boolean;
    format?:format;
}


function encode(obj, path="") {
    let queryString = "";

    const pairs = Object.entries(obj).map(([key, val]) => {
        // Handle the nested, recursive case, where the value to encode is an object itself
        let k=(path?path+'['+key+']':key );

        if (typeof val === "object") {
            return encode(val, k);
        }
        else {
            // Handle base case, where the value to encode is simply a string.
            return [k,val].map(encodeURIComponent).join("=");
        }
    });
    return pairs.join("&");
    //return pairs;
}

export async function zfetch<T>(path: string,
                                params ?: Record<any, any>,
                                options?: Partial<FetchOptions>)
    : Promise<FetchResult<T>> {

    let res: Response;
    let opt: FetchOptions =
        {
            method: "GET",
            bigInt: false,
            format:format.json
        }
    let ret: FetchResult<T> = {
        data: null,
        response: null,
        success: false,
        error_msg: "no response",
        stack: ""
    };
    if (opt)
        opt = {...opt, ...options};

    try {
        let init = {method: opt.method, body: undefined, headers: undefined};
        if ((opt.method == "POST") || (opt.method == "PUT")) {
            init = {
                method: opt.method,
                body: JSON.stringify(params),
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                }
            };
        } else {
            if (params)
            {
                path = path + "?" +  encode(params);

            }
        }

        res = await fetch(path, init);
        if (res.ok) {
            if (res.status == 200)
            {
                if(options.format==format.json)
                    ret.data = await res.json();
                else
                    ret.data = await res.text();

            }
            ret.success = true;
        }

    } catch (ex) {
        if ("stack" in ex) {
            ret.stack = ex["stack"];
        }
        if ("message" in ex) {
            ret.error_msg = ex.message;
        }
    }
    if (res) {
        ret.response = res;
        console.log("fetch:", res.status, res.statusText, res.url);

        if (!res.ok) {
            console.log("fetch:", res.status, res.statusText, res.url);
            ret.error_msg = res.statusText;
        }


    }

    return ret;
}
export default zfetch;

import got, {Response} from "got";
import fs, {NoParamCallback} from "fs";

/**
 * Download and save an image file from a url. Called async
 * @param url - full url to web
 * @param path - full local path NOT ending in slash
 * @param baseFileName - base filename without ext.
 * @param callback - returns the filename with .jpg or .png ext, or error
 */
export async function downloadImg(url:string,path:string,baseFileName:string,callback: (filename,error)=>void)
{
    let response: Response<string>=null;
    let error: any=null;
    try {
        response = await got(url);
        let ext="jpg";
        if(response.statusCode!=200)
        {
            callback(null,new Error("Error downloading image:"+response.statusCode));
            return;
        }
        if(response.body.substr(1,3)=="PNG")
            ext="png";
        let filename=baseFileName+"."+ext;
        fs.writeFile(path+"/"+filename,
            response.rawBody,
            { encoding:"binary"},(err)=> callback(filename,err)  );

    }
    catch (error) {
        //fs.writeFileSync("error.html",error.response.body);
        if(error["response"])
            console.log("error:", error.response.statusCode, "URL:",url);
        callback(null,error);
    }

}

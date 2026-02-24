import { sendDataToSandbox } from "./send_info";
import { FilesService } from "./fileservice";
import { Injectable } from "@nestjs/common"
import { CodeResult } from "../game/game.gateway"



export async function submitCode(ex_name : string , user_id : string, codeToSend : string) : Promise <CodeResult>
{
    let to_send : CodeResult = {trace: "", result: false};
    const filename = `${ex_name}_${user_id}`;

    const filesservice = new FilesService;
    await filesservice.createInstance(filename, codeToSend);
    const response = await sendDataToSandbox(filename);
    to_send.trace = await filesservice.getFileContent(filename);
    await filesservice.deleteInstance(filename);

    if (to_send.trace.length != 0)
        to_send.result = false;
    else
        to_send.result = true;
    return to_send;
}




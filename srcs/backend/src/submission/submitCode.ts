import { sendDataToSandbox } from "./send_info";
import { FilesService } from "./fileservice";
import { CodeResult } from "../game/game.gateway"


export interface SandBoxResponse {
	result: boolean;
	timestamp: string;
}


export async function submitCode(ex_name : string , user_id : string, codeToSend : string) : Promise <CodeResult>
{
    let to_send : CodeResult = {trace: "", result: false};
    const filename = `${ex_name}_${user_id}`;

    try {
        const filesservice = new FilesService;
        await filesservice.createInstance(filename, codeToSend);
        const response : SandBoxResponse = await sendDataToSandbox(filename);
        to_send.trace = await filesservice.getFileContent(filename);
        await filesservice.deleteInstance(filename);

        to_send.result = response.result;
        return to_send;
    }catch (error : any)
    {
        return {
            trace : "",
            result: false
        } as CodeResult;
    }

}




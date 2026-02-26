import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';



const execPromise = promisify(exec);

@Controller()
export class AppController {
  
  @Post('receive')
  @HttpCode(200)
  async handleIncomingData(@Body() data: { file_name: string }) {
    //console.log('received data  :', data);
    
    const command = `./runimage.sh ${data.file_name}`;
    //console.log("Command received = ", command, " \n");

    const timestamp = new Date().toISOString()
    try{
        //console.log ("---- Command gonna be executed ---- \n");
        await execPromise(command);
        //console.log("\n\n\nCommand executed \n\n\n");
        return {
          success: true,
          time: timestamp
        }
    }catch(error : any)
    {
        return {
          success: false,
          time: timestamp
        }
    }
  }
}

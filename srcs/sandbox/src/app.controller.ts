import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';



const execPromise = promisify(exec);

@Controller()
export class AppController {
  
  @Post('receive')
  @HttpCode(200)
  async handleIncomingData(@Body() data: { file_name: string }) {
    //console.log("\n\nbefore exec ==================\n\n");
    const command = `./runimage.sh ${data.file_name}`;

    const timestamp = new Date().toISOString()
    try{
        await execPromise(command);
        return {
          result: true, 
          timestamp: timestamp
        }
    }catch(error : any)
    {
      //console.log("\n\n=========error : ", error.message);
        return {
          result: false,
          timestamp: timestamp
        }
    }
  }
}


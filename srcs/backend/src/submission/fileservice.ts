import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as fss from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class FilesService
{
    async createSubmitFile(filename: string, content: string)
    {
        const directory = "/app/submissions";
        try
        {
            await fs.mkdir(directory, {recursive: true});

            const filePath = path.join(directory, filename);

            await fs.writeFile(filePath, content, "utf8");

            return ;
        }catch (error : any)
        {
            throw new Error(`Error while creating the file: ${error.message} \n`);
        }
    }

    async createResultFile(filename: string)
    {
        const directory = "/app/results";
        try
        {
            await fs.mkdir(directory, {recursive: true});

            const filePath = path.join(directory, filename);

            await fs.writeFile(filePath, "", "utf8");

            return ;
        }catch (error : any)
        {
            throw new Error(`Error while creating the file: ${error.message} \n`);
        }
    }

    async getFileContent(filename: string)
    {
        const directory = "/app/results";

        try 
        {
            const filepath = path.join(directory, filename);

            const data = fss.readFileSync(filepath, 'utf-8');
            data.trim();
            return (data);
        }catch (error)
        {
            throw new Error("Error while getting response from checker \n");
        }
    }

    async deleteFile(path : string)
    {
        try
        {
            await fs.rm(path, { recursive: true } );
            return ;
        }catch(error)
        {
            throw new Error('Error while deleting the file\n');
        }
    }

    async createInstance(filename : string, code : string)
    {
        this.createSubmitFile(filename, code);
        this.createResultFile(filename);
        return (1);
    }

    async deleteInstance(filename : string)
    {
        this.deleteFile(`/app/results/${filename}`);
        this.deleteFile(`/app/submissions/${filename}`);
        return (1);
    }
}

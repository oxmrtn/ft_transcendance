import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ProfileService
{
    async updatePicture(file : MultipartFile)
	{
		if (file.mimetype === "image/jpeg" || file.mimetype === "image/png")
			fs.promises.writeFile(`./src/profile/pictures/${file.filename}`, await file.toBuffer());
    }
}

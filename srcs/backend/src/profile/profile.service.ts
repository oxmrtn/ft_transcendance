import { MultipartFile } from '@fastify/multipart';
import { Injectable, UnsupportedMediaTypeException} from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ProfileService
{
    async updatePicture(picture : MultipartFile)
	{
		if (picture.mimetype !== "image/jpeg" && picture.mimetype !== "image/png")
			throw new UnsupportedMediaTypeException('Profile picture must be jpg or png only.');
		fs.promises.writeFile(`./src/profile/pictures/${picture.filename}`, await picture.toBuffer());
    }

	udpateData(username?: string, mail?: string, password?: string )
	{
		if(username)
			console.log(username);
		if(password)
			console.log(password);
		if(mail)
			console.log(mail)
	}
}

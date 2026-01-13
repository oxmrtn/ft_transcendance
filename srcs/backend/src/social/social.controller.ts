import { Controller, 
		Get, Post, Delete, Patch,
		Query, Req, Param,
		UseGuards, ValidationPipe, ParseIntPipe,
	} from '@nestjs/common';
import { SocialService } from './social.service';
//import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { IdParamDto } from 'src/dto/id-param.dto';
import { SearchQueryDto } from 'src/dto/search-query.dto';

/* modifier req.user.id manuellement pout tester */
@Controller('social')
//@UseGuards(JwtAuthGuard)//guard pour toutes les routes du module
export class SocialController
{
	constructor(private readonly socialService: SocialService) {}

	@Get('search')
	search(@Query() query: SearchQueryDto)
	{
		return this.socialService.searchUsers(query.q);
	}

	@Get('friends')
	getFriends(@Req() req)
	{
		return this.socialService.getFriends(req.user.id, 'ACCEPT');
	}

	@Post('request/:id')
	sendRequest(@Req() req, @Param() param: IdParamDto)
	{
		return this.socialService.sendFriendRequest(req.user.id, param.id);
	}

	@Patch('request/:id/accept')
	accept(@Req() req, @Param() param: IdParamDto)
	{
		return this.socialService.handleRequest(req.user.id, param.id, true);
	}

	@Patch('request/:id/reject')
	reject(@Req() req, @Param() param: IdParamDto)
	{
		return this.socialService.handleRequest(req.user.id, param.id, false);
	}

	@Delete('friends/:id')
	remove(@Req() req, @Param() param: IdParamDto)
	{
		return this.socialService.removeFriend(req.user.id, param.id);
	}

	@Get('request')
	getRequest(@Req() req)
	{
		return this.socialService.getFriends(req.user.id, 'PENDING');
	}
}



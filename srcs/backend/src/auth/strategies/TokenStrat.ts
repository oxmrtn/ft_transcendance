import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TokenStrat extends PassportStrategy(Strategy) {
    constructor(private configservice : ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // ça ça pourrait se passer à true pour dev, et pas avoir à se relog pour avoir un nouveau token toutes les 15 min
            secretOrKey: configservice.get<string>('JWT_SECRET'), 
        });
    }

validate (payload : any) {
	return payload;
}
}
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {  ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TokenStrat extends PassportStrategy(Strategy) {
    constructor(private configservice : ConfigService){
        super({
            jwtFroRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configservice.get<string>('JWT_SECRET'), 
        });
    }
}
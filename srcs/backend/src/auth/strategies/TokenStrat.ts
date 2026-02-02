import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TokenStrat extends PassportStrategy(Strategy) {
    constructor(private configservice : ConfigService){
        super({ //le mot clé "super" permet de faire appel au constructur de la classe parent pour l'initialiser correctement (sans ça Passport sait pas comment faire son taff)
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // là on précise où passport doit aller chercher le JWT : dans le header Authorization. Alors pourquoi bearer ? En fait y'a plusieurs types d'auth, et bearer c'est pour indiquer qu'il porte un token. Donc on doit avoir un header composé comme suit : Authorization : bearer TOKEN
            ignoreExpiration: false, // ça ça pourrait se passer à true pour dev, et pas avoir à se relog pour avoir un nouveau token toutes les 15 min
            secretOrKey: configservice.get<string>('JWT_SECRET'), 
        });
    }

validate (payload : any) {
	return payload; //payload c'est ce qui se trouve à l'intérieur du JWT une fois décrypté grace à notre super secret qui se trouve dans l'env et qui est publiquement disponible sur github ! J'ai pas utilisé la fonction validate_token déjà présente dans auth, parce qu'il s'agit d'un appele à jwt.verify qui est en fait appelée sous le capot de validate par Passport 
}
}
import {
 Injectable,
 CanActivate,
 ExecutionContext,
} from '@nestjs/common';


import {
 Reflector,
} from '@nestjs/core';


import {
 ROLES_KEY,
} from '../../roles/roles.decorator';



@Injectable()

export class RolesGuard
implements CanActivate{


constructor(
private reflector:Reflector,
){}



canActivate(
context:ExecutionContext,
){


const roles =
this.reflector.getAllAndOverride<string[]>(
ROLES_KEY,
[
context.getHandler(),
context.getClass(),
],
);



if(!roles){

return true;

}



const request =
context.switchToHttp().getRequest();



const user =
request.user;



if(!user){

return false;

}



return roles.includes(
user.role,
);



}



}
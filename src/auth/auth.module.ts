import { Global, Module, forwardRef } from "@nestjs/common";
import { authController } from "./auth.controller";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { BaseGuard } from "./guard/index";
import { UserModule } from "../user/user.module";


@Global()
@Module({
    imports: [
        JwtModule.register({}),
        forwardRef(() => UserModule),
    ],
    controllers: [authController],
    providers: [AuthService, BaseGuard, JwtService],
    exports: [AuthService, BaseGuard, JwtService]
})

export class AuthModule { };
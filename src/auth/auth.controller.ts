import { Body, Controller, Post, Get, UseGuards, UseInterceptors, Param } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto, LoginUserDto } from "../user/Dtos/create-user.dto";
import { EmailDto } from "./Dtos/email.dto";
import { RemovePasswordInterceptor } from "./auth.interceptor";
import { User } from "../decorators/current-user.decorator";
import { BaseGuard } from "./guard";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { PreSignUpResponseDto } from "./Dtos/response/pre-signup.dto";

@ApiTags('Authentication')
@UseInterceptors(RemovePasswordInterceptor)
@Controller('auth')
export class authController {
    constructor(private readonly authService: AuthService) { };

    @ApiOkResponse({ description: "send email for validating email", type: PreSignUpResponseDto })
    @Post('signup')
    mail(@Body() body: EmailDto) {
        return this.authService.preSignup(body);
    }

    @Post('signup/:verifyCode')
    signup(@Body() body: CreateUserDto, @Param("verifyCode") uuid: string) {
        return this.authService.signup(body, uuid);
    }

    @Post('login')
    login(@Body() body: LoginUserDto) {
        return this.authService.login(body);
    }

    @UseGuards(BaseGuard)
    @Get('/')
    auth(@User() user: Record<string, any>) {
        return user;
    }
};
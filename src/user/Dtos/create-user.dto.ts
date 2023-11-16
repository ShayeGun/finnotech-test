import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsStrongPassword()
    password: string;
}

export class LoginUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}
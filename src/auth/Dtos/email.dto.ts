import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class EmailDto {
    @ApiProperty()
    @IsEmail()
    email: string;
}

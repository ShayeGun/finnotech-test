import { ApiProperty } from "@nestjs/swagger";

export class PreSignUpResponseDto {
    @ApiProperty()
    data: string;
}

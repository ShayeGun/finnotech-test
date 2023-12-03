import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumberString, IsOptional } from "class-validator";

enum OrderBy {
    TITLE = 'title',
    CREATE_DATE_TIME = 'createDateTime',
}

export class PostQueryDto {
    @ApiProperty()
    @IsEnum(OrderBy)
    @IsOptional()
    order: string;

    @ApiProperty()
    @IsNumberString()
    @IsOptional()
    take: number;

    @ApiProperty()
    @IsNumberString()
    @IsOptional()
    skip: number;
}
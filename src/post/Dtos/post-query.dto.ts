import { IsEnum, IsNumberString, IsOptional } from "class-validator";

enum OrderBy {
    TITLE = 'title',
    CREATE_DATE_TIME = 'createDateTime',
}

export class PostQueryDto {
    @IsEnum(OrderBy)
    @IsOptional()
    order: string;

    @IsNumberString()
    @IsOptional()
    take: number;

    @IsNumberString()
    @IsOptional()
    skip: number;
}
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, PostQueryDto } from './Dtos';
import { User } from '../decorators/current-user.decorator';
import { BaseGuard } from '../auth/guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Posts')
@UseGuards(BaseGuard)
@Controller('post')
export class PostController {
    constructor(
        private readonly postService: PostService
    ) { }

    @Post()
    addPost(@Body() body: CreatePostDto, @User() user: number) {
        return this.postService.addOne(body, user);
    }

    @Get()
    getByUserId(@User() user: number, @Query() query: PostQueryDto) {
        return this.postService.findAllForOneUser(user, query);
    }

    @Get('all')
    getAll(@Query() query: PostQueryDto) {
        return this.postService.findAllForAllUsers(query);
    }
}

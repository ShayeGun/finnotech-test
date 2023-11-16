import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './schema/post.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    UserModule,
  ],
  providers: [PostService],
  controllers: [PostController]
})
export class PostModule { }

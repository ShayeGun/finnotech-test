import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post } from './schema/post.schema';
import { CreatePostDto, PostQueryDto } from './Dtos';
import { UsersService } from '../user/user.service';

@Injectable()
export class PostService {
    constructor(
        private readonly userService: UsersService,
        @InjectRepository(Post) private postRepository: Repository<Post>
    ) { }

    async addOne(data: CreatePostDto, userId: number): Promise<Post> {
        try {

            const user = await this.userService.findOneById(userId);
            const newPost = this.postRepository.create(data);
            newPost.user = user;
            const post = await this.postRepository.save(newPost);
            delete post.user.password;

            return post;
        } catch (err) {
            throw new BadRequestException(err.message);
        }

    }

    findAllForAllUsers(filter: PostQueryDto): Promise<Post[] | null> {
        const query = this.postRepository.createQueryBuilder("post");

        if (filter?.order) query.orderBy(`post.${filter.order}`);
        if (filter?.skip) query.skip(filter.skip);
        if (filter?.take) query.take(filter.take);

        return query.getMany();
    }

    findAllForOneUser(id: number, filter: PostQueryDto): Promise<Post[]> {
        const query = this.postRepository.createQueryBuilder("post")
            .leftJoin('post.user', 'user')
            .where("post.userId = :id", { id });

        if (filter?.order) query.orderBy(`post.${filter.order}`);
        if (filter?.skip) query.skip(filter.skip);
        if (filter?.take) query.take(filter.take);

        return query.getMany();
    }
}

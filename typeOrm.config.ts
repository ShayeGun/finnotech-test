import { DataSource } from "typeorm";
import { config } from 'dotenv';
import { ConfigService } from "@nestjs/config";
import { Post } from "src/post/schema/post.schema";
import { User } from "src/user/schema/user.schema";

config();
const configService = new ConfigService();

export default new DataSource({
    type: 'postgres',
    port: configService.get<number>('DATABASE_PORT'),
    host: configService.get<string>('DATABASE_URL'),
    username: configService.get<string>('DATABASE_USER'),
    password: configService.get<string>('DATABASE_PASS'),
    entities: [User, Post],
    migrations: ["/migrations/**"],
});
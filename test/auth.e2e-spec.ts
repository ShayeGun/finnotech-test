import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { RedisModule } from '../src/redis/redis.module';
import { REDIS_CLIENT } from '../src/redis/constants';
import { MailModule } from '../src/mail/mail.module';
import * as nodemailer from 'nodemailer';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/user/schema/user.schema';
import { Post } from '../src/post/schema/post.schema';
import { APP_PIPE } from '@nestjs/core';
import { Repository } from 'typeorm';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let cacheService: Redis;
    let userRepository: Repository<User>;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: '.env',
                }),
                TypeOrmModule.forRootAsync({
                    inject: [ConfigService],
                    useFactory: (configService: ConfigService) => ({
                        type: 'postgres',
                        port: configService.getOrThrow('DATABASE_PORT'),
                        host: configService.getOrThrow('DATABASE_URL'),
                        username: configService.getOrThrow('DATABASE_USER'),
                        password: configService.getOrThrow('DATABASE_PASS'),
                        synchronize: configService.getOrThrow('DATABASE_SYNCHRONIZE'),
                        entities: [User, Post],
                        migrations: ["src/migrations/*{.ts,.js}"],
                        cli: {
                            migrationsDir: "./src/migrations"
                        }
                    })
                }),
                RedisModule.register(
                    {
                        useFactory: (configService: ConfigService) => new Redis({
                            host: configService.getOrThrow('REDIS_URL'),
                            port: configService.getOrThrow('REDIS_PORT'),
                            password: configService.getOrThrow('REDIS_PASSWORD'),
                        }),
                        inject: [ConfigService]
                    }
                ),
                MailModule.register({
                    useFactory: (configService: ConfigService) => nodemailer.createTransport({
                        host: configService.getOrThrow('MAIL_HOST'),
                        port: configService.getOrThrow('MAIL_PORT'),
                        secure: true,
                        auth: {
                            user: configService.getOrThrow('MAIL_USER'),
                            pass: configService.getOrThrow('MAIL_PASSWORD'),
                        }
                    }),
                    inject: [ConfigService]
                }),
                AuthModule,
            ],
            providers: [
                {
                    provide: APP_PIPE,
                    useClass: ValidationPipe,
                }
            ]
        }).compile();

        userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
        await userRepository.query('TRUNCATE TABLE public."user" CASCADE;');
        cacheService = moduleFixture.get<Redis>(REDIS_CLIENT);

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    beforeEach(async () => {
        await cacheService.flushdb();
        await userRepository.delete({});
    });

    afterAll(async () => {
        await cacheService.flushall();
        await userRepository.delete({});
        await app.close();
    });

    /**
     * =================================================================
     * ========================== BEGIN TESTS ==========================
     * =================================================================
     */

    it('/auth/signup (POST) - FAILED - invalid Body format', async () => {
        const response = await request(app.getHttpServer()).post('/auth/signup');
        return expect(response.status).toEqual(400);
    });

    it('/auth/signup (POST) - SUCCESS', async () => {
        const response = await request(app.getHttpServer()).post('/auth/signup').send({ email: 'test@test.com' });
        return expect(response.status).toEqual(201);
    });

    it('auth/signup/1234 (POST) - FAILED - invalid password', async () => {
        const response = await request(app.getHttpServer()).post('/auth/signup/1234').send({ email: 'test@test.com' });
        return expect(response.status).toEqual(400);
    });

    it('auth/signup/1234 (POST) - FAILED - email not verified', async () => {
        const response = await request(app.getHttpServer()).post('/auth/signup/1234').send({ email: 'test@test.com', password: 'Test@123' });
        return expect(response.status).toEqual(400);
    });

    it('auth/signup/1234 (POST) - SUCCESS', async () => {
        const data = { email: 'test@test.com', password: 'Test@123' };
        await cacheService.set('1234', data.email);
        const response = await request(app.getHttpServer()).post('/auth/signup/1234').send(data);
        return expect(response.status).toEqual(201);
    });
});
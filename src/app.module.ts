import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './app.filter';
import { User } from './user/schema/user.schema';
import { Post } from './post/schema/post.schema';
import { RedisModule } from './redis/redis.module';
import * as nodemailer from 'nodemailer';
import { MailModule } from './mail/mail.module';
import { Redis } from 'ioredis';
import { PostModule } from './post/post.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
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
    AuthModule,
    UserModule,
    PostModule,
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
  ],
})

export class AppModule { }

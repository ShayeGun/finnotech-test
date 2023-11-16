import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from '../redis/constants';
import { NODEMAILER_CLIENT } from '../mail/constants';
import { Redis } from 'ioredis';
import { sign } from 'jsonwebtoken';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/schema/user.schema';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
    let service: AuthService;
    let userService: UsersService;
    let cacheService: Redis;

    const mockJwtService = {
        signAsync: jest.fn().mockImplementation((data) => sign(data, 'secret')),
        compare: jest.fn()
    };
    const mockConfigService = {
        get: jest.fn()
    };
    const mockCacheService = {
        set: jest.fn(),
        get: jest.fn(),
        del: jest.fn(),
    };
    const mockMailService = {
        sendMail: (...args: any[]) => ({ data: "ok" })
    };
    const mockUserService = {
        findOne: jest.fn(),
        addOne: jest.fn().mockImplementation((user) => user),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthService, UsersService, JwtService, ConfigService,
                {
                    provide: REDIS_CLIENT,
                    useValue: mockCacheService
                },
                {
                    provide: NODEMAILER_CLIENT,
                    useValue: mockMailService
                }
            ]
        })

            .overrideProvider(UsersService)
            .useValue(mockUserService)

            .overrideProvider(JwtService)
            .useValue(mockJwtService)

            .overrideProvider(ConfigService)
            .useValue(mockConfigService)

            .compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get<UsersService>(UsersService);
        cacheService = module.get<Redis>(REDIS_CLIENT);

    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('successful send validation email', async () => {
        expect(await service.preSignup({ email: "test@test.com" })).toEqual({
            data: expect.any(String)
        });
    });

    it('successful signup', async () => {
        jest.spyOn(userService, 'findOne').mockImplementationOnce(() => null);
        jest.spyOn(cacheService, 'get').mockImplementationOnce(async () => "test@test.com");
        jest.spyOn(cacheService, 'del').mockImplementationOnce(() => null);

        expect(await service.signup({ email: "test@test.com", password: "test1234@" }, '123')).toEqual({
            user: expect.any(Object),
            accessToken: expect.any(String)
        });
    });

    it('unsuccessful signup (no cache)', async () => {
        try {
            jest.spyOn(cacheService, 'get').mockImplementationOnce(async () => null);

            await service.signup({ email: "test@test.com", password: "test1234@" }, '123');
        } catch (err) {
            expect(err).toBeInstanceOf(BadRequestException);
        }
    });

    it('unsuccessful signup (email already existed)', async () => {
        try {
            jest.spyOn(userService, 'findOne').mockImplementationOnce(async () => new User());

            await service.signup({ email: "test@test.com", password: "test1234@" }, '123');
        } catch (err) {
            expect(err).toBeInstanceOf(BadRequestException);
        }
    });

    it('successful login', async () => {
        jest.spyOn(userService, 'findOne').mockImplementationOnce(async () => new User());
        jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => true);

        expect(await service.login({ email: "test@test.com", password: "test1234@" })).toEqual({
            user: expect.any(Object),
            accessToken: expect.any(String)
        });
    });

    it('unsuccessful login (no email found)', async () => {
        try {
            jest.spyOn(userService, 'findOne').mockImplementationOnce(async () => null);

            await service.login({ email: "test@test.com", password: "test1234@" });
        } catch (err) {
            expect(err).toBeInstanceOf(BadRequestException);
        }
    });

    it('unsuccessful login (incorrect password)', async () => {
        try {
            jest.spyOn(userService, 'findOne').mockImplementationOnce(async () => new User());
            jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => false);

            await service.login({ email: "test@test.com", password: "test1234@" });
        } catch (err) {
            expect(err).toBeInstanceOf(UnauthorizedException);
        }
    });
});
